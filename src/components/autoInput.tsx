import { ChangeEvent, CSSProperties, useEffect, useRef, useState } from "react";
import Icon, { ICONS } from "./icon";
import Image from "next/image";
import { AutoInputFilter, AutoInputSearchResult, AutoInputManager } from "@/lib/components/autoInput";
import { useLocale, useTranslations } from "next-intl";
import "@/styles/components/autoInput.css";
import { areEquals, getImageUrl, isEmpty, translateNullable } from "@/lib/utils";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import { useFormContext } from "./dataForm";

/**
 * 
 * @returns 
 */
export default function AutoInput ({className, disabled=false, fieldName, filterIn, filterOut, helpText, idExtractor, initialData, inputStyle, label, labelStyle, manager, max=5, minDecodeSize=3, multiple=false, noDelay=false, onChange, param, paramRequired=false, placeholder, required = false, requiredIfPresent = false, style, emptyIfUnselected = false}: Readonly<{
    className?: string,
    disabled?: boolean;
    hasError?: boolean;
    /**Field name to be used in a form*/
    fieldName?: string;
    filterIn?: AutoInputFilter,
    filterOut?: AutoInputFilter,
    helpText?: string,
    idExtractor?: (r: AutoInputSearchResult) => string | number,
    initialData?: (number | string)[],
    inputStyle?: CSSProperties,
    label?: string,
    /**Defines which auto input manager to use, who handles the search request, passes and filters search results */
    manager: AutoInputManager,
    labelStyle?: CSSProperties,
    /**Max items a user can select, it is overridden to 1 if multiple is set to false */
    max?: number,
    /**Minimum number of chars before running a search query */
    minDecodeSize?: number,
    multiple?: boolean,
    /**Do not throttle input events before launching a search request */
    noDelay?: boolean,
    onChange?: (values: AutoInputSearchResult[], newValues?: AutoInputSearchResult[], removedValue?: AutoInputSearchResult) => void,
    param?: any,
    /**Param is required for the component to be enabled */
    paramRequired?: boolean,
    placeholder?: string,
    required?: boolean,
    /**Sets itself to required, whether there's anything in the remote datasource */
    requiredIfPresent?: boolean,
    style?: CSSProperties,
    emptyIfUnselected?: boolean
  }>) {
    const t = useTranslations('components');

    /* States */
    /**Selected ids */
    const [selectedIds, setSelectedIds] = useState(initialData ?? []);
    /**Rendered selected values */
    const [selectedValues, setSelectedValues] = useState<AutoInputSearchResult[]>([]);
    /**Read search input text */
    const [searchInput, setSearchInput] = useState("");
    /**If the values are loading */
    const [isLoading, setIsLoading] = useState(false);
    /**If there was a search error */
    const [searchError, setSearchError] = useState(false);
    /**If component is focused */
    const [isFocused, setIsFocused] = useState(false);
    /**Search results */
    const [searchResults, setSearchResults] = useState<AutoInputSearchResult[]>([]);
    /**Validity */
    const [isValid, setIsValid] = useState(false);
    /**Required */
    const [isRequired, setRequired] = useState(required);

    /* latest initialData */
    const [latestInitialData, setLatestInitialData] = useState<(number | string)[]>();

    /* waitForParam */
    const [waitForParam, setWaitForParam] = useState(false);

    /* reset */
    const { reset = false } = useFormContext();

    const inputRef = useRef<HTMLInputElement>(null);

    const locale = useLocale();

    /* Props check */
    const maxSelections = multiple == false ? 1 : max;
    if ((selectedIds).length > maxSelections) throw 'Input values exceed maximum allowed';

    /**Adds a new item to the selection */
    const addItem = (toAdd: AutoInputSearchResult) => {
        let cloneSelectedIds = [...selectedIds];
        if (manager.codeOnly) {
            cloneSelectedIds.push (toAdd.code!);
        } else {
            cloneSelectedIds.push (toAdd.id!);
        }
        setSelectedIds (cloneSelectedIds);
        setSelectedValues([...selectedValues ?? [], toAdd]);
        setSearchInput("");
        setSearchResults([]);
        onChange && onChange (selectedValues ?? [], [toAdd], undefined);
        setTimeout (()=>inputRef.current?.focus(), 100);
    }
    
    /**Remove a item from the selection */
    const removeItem = (toRemove: AutoInputSearchResult) => {
        let identifier = manager.codeOnly ? toRemove.code! : toRemove.id!;
        if (selectedIds.includes (identifier)) {
            let newSelectedIds = [...selectedIds ?? []];
            newSelectedIds.splice (selectedIds.indexOf (identifier), 1);
            let newSelectedValues = [...selectedValues ?? []];
            newSelectedValues.splice (selectedValues.indexOf (toRemove), 1);
            setSelectedIds(newSelectedIds);
            setSelectedValues(newSelectedValues);
            setSearchResults([]);
            onChange && onChange (selectedValues ?? [], undefined, toRemove);    
        }
    }

    /**
     * Loads the search result
     * @param searchString 
     */
    const searchItem = (searchString: string) => {
        setIsLoading(true);
        setSearchResults([]);
        let excludeFilter = AutoInputFilter.getForSelected(manager, selectedIds);
        if (filterOut) excludeFilter = excludeFilter.merge(filterOut);
        manager.searchByValues(searchString.trim(), locale, filterIn, excludeFilter, param).then (results => {
            setSearchResults(results);
            setSearchError(results.length == 0);
        }).catch(err=>{
            setSearchError(true);
        }).finally(()=> {
            setIsLoading(false);
        });
    }

    let searchTimeoutHandle: any;

    /**Queue a new search request */
    useEffect(() => {
        clearTimeout(searchTimeoutHandle);
        if(searchInput.trim ().length >= minDecodeSize && isFocused){
            searchTimeoutHandle = setTimeout(() => {
                searchItem(searchInput);
            }, noDelay ? 0 : 500);
        } else setSearchResults([]);
    }, [searchInput, isFocused]);

    /**Parameter changed, selections must be cleared */
    useEffect(() => {
        setIsFocused(false);
        setSearchError(false);
        setSearchResults([]);
        setIsLoading(false);
        clearTimeout(searchTimeoutHandle);
        setRequired(required);
        if (requiredIfPresent && param) {
            manager.isPresent (param).then ((isPresent) => {
                setRequired(isPresent);
            });
        } else if (param == null || param == undefined) {
            setIsFocused(false);
            setSearchError(false);
            setSearchResults([]);
            setIsLoading(false);
            clearTimeout(searchTimeoutHandle);
            setSelectedIds([]);
            setSelectedValues([]);
        }
    }, [param]);

    /**Cancel any pending search event */
    const onSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchInput (e.currentTarget.value);
        clearTimeout (searchTimeoutHandle);
    };

    const onBlur = (e: ChangeEvent<HTMLInputElement>) => {
        setIsFocused(false);
        setSearchError(false);
        setSearchResults([]);
        setIsLoading(false);
        clearTimeout(searchTimeoutHandle);
        if (emptyIfUnselected) {
            setTimeout(()=>setSearchInput(""), 100);
        }
    }

    useEffect(()=> {
        if ((initialData !== undefined && (!areEquals(initialData, latestInitialData) || reset)) || (waitForParam && param)) {
            if (!param && paramRequired) {
                setWaitForParam(true);
                return;
            }
            manager.loadByIds(new AutoInputFilter(manager.codeOnly ? [] : initialData as number[], manager.codeOnly ? initialData as string[] : []), idExtractor, [param])
            .then((values)=>{
                setSelectedValues (values);
                if (manager.codeOnly) {
                    setSelectedIds (values.map(val=>val.code!));
                } else {
                    setSelectedIds (values.map(val=>val.id!));
                }
                onChange && onChange (values ?? [], values, undefined);
            });
        } else if (reset) {
            setSelectedValues([]);
            setSelectedIds([]);
            setSearchInput("");
            setSearchResults([]);
            onChange && onChange ([], [], undefined);
        }
        setWaitForParam(false);
        setLatestInitialData(initialData);
    }, [initialData, param, reset]);

    /**
     * Renders each search result
     * @param element search result element
     * @param index search result index
     * @returns the rendered node
     */
    const renderResult = (element: AutoInputSearchResult, index: number) => {
        return <div key={index} className="search-result horizontal-list flex-vertical-center rounded-s" style={{color:'#fff',display:'flex'}} onMouseDown={()=>{addItem(element)}}>
            {element.imageUrl !== undefined &&
                <Image unoptimized src={getImageUrl(element.imageUrl) ?? EMPTY_PROFILE_PICTURE_SRC} width={32} height={32} 
                    alt={t('autoinput.alt_result_image', {description: element.description})}></Image>
            }
            {element.icon !== undefined && <Icon iconName={element.icon!}></Icon>}
            <div className="title" style={{flex:1}}>
                {translateNullable(element.translatedDescription, locale) ?? element.description}
            </div>
            <Icon className="medium" iconName={ICONS.ADD_CIRCLE}></Icon>
        </div>;
    }

    const valueToSet: (string | number | undefined)[] = selectedValues.map(value => manager.codeOnly ? value.code! : value.id!);

    const renderSelected = (element: AutoInputSearchResult, index: number) => {
        return <a key={index} className={`selected-value horizontal-list flex-vertical-center ${selectedIds.length == 1 && !multiple ? "single" : ""}`}>
                {element.imageUrl !== undefined &&
                    <Image unoptimized src={isEmpty(element.imageUrl) ? EMPTY_PROFILE_PICTURE_SRC : getImageUrl(element.imageUrl)!} width={32} height={32}
                        alt={t('autoinput.alt_result_image', {description: element.description})}></Image>
                }
                {element.icon !== undefined && <Icon iconName={element.icon}></Icon>}
                <span className="title small" style={{flex:1}}>
                    {translateNullable(element.translatedDescription, locale) ?? element.description}
                </span>
                <span  onClick={()=>removeItem(element)}><Icon className="medium delete-selection" iconName={ICONS.CANCEL}></Icon></span>
            </a>;
    }

    const renderedValue = idExtractor ? selectedValues.map(val => idExtractor(val)) : valueToSet ?? [];
    
    const checkChange = () => {
        setIsValid ((valueToSet.length <= maxSelections && ((valueToSet.length > 0 && isRequired))) || !isRequired);
    }

    return <>
        <div className={`autocomplete-input ${className ?? ""} ${disabled ? "disabled": ""}`} style={{...style, zIndex: isFocused ? 100 : 0}}>
            <label htmlFor={fieldName} className={`title semibold small margin-bottom-1mm ${isRequired ? "required" : ""}`} style={{...labelStyle}}>{label}</label>
            <input tabIndex={-1} className="suppressed-input" type="text" name={fieldName} value={renderedValue.join(",") ?? ""} required={isRequired} onChange={checkChange}></input>
            <div style={{position: 'relative'}}>
                <div className="input-container horizontal-list flex-vertical-center rounded-s margin-bottom-1mm">
                    {selectedValues?.map ((element, index) => renderSelected(element, index))}
                    {
                        selectedIds.length < maxSelections && (
                            <input
                                ref={inputRef}
                                className={`input-field title ${!isValid && isRequired ? "danger" : ""}`}
                                style={{...inputStyle}}
                                placeholder={placeholder ?? ""}
                                type="text"
                                disabled={disabled || (paramRequired && !param) || (!isRequired && requiredIfPresent)}
                                onChange={onSearchTextChange}
                                onFocus={()=>setIsFocused (true)}
                                onBlur={onBlur}
                                value={searchInput ?? ""}
                            />
                        ) || <div className="spacer"></div>
                    }
                    {
                        multiple && valueToSet.length < maxSelections && 
                        <span className="icon-container">
                            { isLoading && isFocused
                            ? <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
                            : <Icon className="medium" iconName={ICONS.SEARCH}></Icon>
                            }
                        </span>
                    }
                </div>
                {
                    isFocused && valueToSet.length < maxSelections && (
                    <div tabIndex={0} className="search-result-container rounded-m" style={{position:'absolute',marginTop:"5px",flexDirection:'column',width:"100%",maxHeight: "200px",overflowY: "auto",}}>
                        {
                            searchInput.length < minDecodeSize
                            ? <span className="title tiny color-subtitle">{t('autoinput.guide', {minSize: minDecodeSize})}</span>
                            :!searchError
                                ? searchResults.length > 0 
                                    ? searchResults.map((element, index) => renderResult(element, index))
                                    : <span className="title tiny color-subtitle">{t('autoinput.loading_data')}</span>
                                :<span className="title tiny color-subtitle">{t('autoinput.no_results')}</span>
                        }
                    </div>
                    )
                }
            </div>
        </div>
        {helpText && helpText.length > 0 && <span className="help-text tiny descriptive color-subtitle">{helpText}</span>}
    </>
}