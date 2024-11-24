import { ChangeEvent, CSSProperties, useEffect, useRef, useState } from "react";
import Icon, { ICONS } from "./icon";
import Image from "next/image";
import { AutoInputFilter, AutoInputSearchResult, AutoInputTypeManager, getFilterForSelected } from "../_lib/components/autoInput";
import { useTranslations } from "next-intl";
import "../styles/components/autoInput.css";

export default function AutoInput ({className, disabled=false, fieldName, filterIn, filterOut, initialData, inputStyle, label, labelStyle, max=5, minDecodeSize=3, multiple=false, noDelay=false, onChange, param, paramRequired=false, placeholder, required = false, requiredIfPresent = false, style, type}: Readonly<{
    className?: string,
    disabled?: boolean;
    hasError?: boolean;
    /**Field name to be used in a form*/
    fieldName?: string;
    filterIn?: AutoInputFilter,
    filterOut?: AutoInputFilter,
    initialData?: (number | string)[],
    inputStyle?: CSSProperties,
    label?: string,
    labelStyle?: CSSProperties,
    /**Max items a user can select, it is overridden to 1 if multiple is set to false */
    max?: number,
    /**Minimum number of chars before running a search query */
    minDecodeSize?: number,
    multiple?: boolean,
    noDelay?: boolean,
    onChange?: (values: AutoInputSearchResult[], newValue?: AutoInputSearchResult, removedValue?: AutoInputSearchResult) => void,
    param?: string,
    paramRequired?: boolean,
    placeholder?: string,
    required?: boolean,
    /**Sets itself to required, whether there's anything in the remote datasource */
    requiredIfPresent?: boolean,
    style?: CSSProperties,
    type: AutoInputTypeManager
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

    const inputRef = useRef<HTMLInputElement>(null);

    /* Props check */
    const maxSelections = multiple == false ? 1 : max;
    if ((selectedIds).length > maxSelections) throw 'Input values exceed maximum allowed';

    /**Adds a new item to the selection */
    const addItem = (toAdd: AutoInputSearchResult) => {
        let cloneSelectedIds;
        if (type.codeOnly) {
            cloneSelectedIds = [...selectedIds as string[]];
            cloneSelectedIds.push (toAdd.code!);
        } else {
            cloneSelectedIds = [...selectedIds as number[]];
            cloneSelectedIds.push (toAdd.id!);
        }
        setSelectedIds (cloneSelectedIds);
        setSelectedValues([...selectedValues ?? [], toAdd]);
        setSearchInput("");
        setSearchResults([]);
        onChange && onChange (selectedValues ?? [], toAdd, undefined);
        setTimeout (()=>inputRef.current?.focus(), 100);
    }
    
    /**Remove a item from the selection */
    const removeItem = (toRemove: AutoInputSearchResult) => {
        let containsCondition;
        let identifier = type.codeOnly ? toRemove.code! : toRemove.id!
        containsCondition = selectedIds.includes (identifier);
        if (containsCondition) {
            let newSelectedIds = [...selectedIds ?? []];
            newSelectedIds.splice (selectedIds.indexOf (identifier), 1);
            let newSelectedValues = [...selectedValues ?? []];
            newSelectedValues.splice (selectedValues.indexOf (toRemove), 1);
            setSelectedIds (newSelectedIds);
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
        type.searchByValues(searchString.trim(), getFilterForSelected(selectedIds), param).then (results => {
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
        if (requiredIfPresent) {

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
    }

    useEffect(()=> {
        if (initialData !== undefined) {
            type.loadByIds(new AutoInputFilter(type.codeOnly ? [] : initialData as number[], type.codeOnly ? initialData as string[] : []))
            .then((values)=>setSelectedValues (values));
        }   
    }, []);

    /**
     * Renders each search result
     * @param element search result element
     * @param index search result index
     * @returns the rendered node
     */
    const renderResult = (element: AutoInputSearchResult, index: number) => {
        return <div key={index} className="search-result horizontal-list flex-vertical-center rounded-s" style={{color:'#fff',display:'flex'}} onMouseDown={()=>{addItem(element)}}>
            {element.imageUrl !== undefined &&
                (<Image src={element.imageUrl!} width={32} height={32} alt={t('autoinput.alt_result_image', {description: element.description})}></Image>)
            }
            {element.icon !== undefined &&
                (<Icon iconName={element.icon!}></Icon>)
            }
            <div className="title" style={{flex:1}}>
                {element.description}
            </div>
            <Icon className="medium" iconName={ICONS.ADD_CIRCLE}></Icon>
        </div>;
    }

    const valueToSet: (string | number | undefined)[] = selectedValues.map(value => type.codeOnly ? value.code! : value.id!);

    const renderSelected = (element: AutoInputSearchResult, index: number) => {
        return <a key={index} className={`selected-value horizontal-list flex-vertical-center ${selectedIds.length == 1 && !multiple ? "single" : ""}`}>
                {element.imageUrl !== undefined &&
                    <Image src={element.imageUrl!} width={32} height={32} alt={t('autoinput.alt_result_image', {description: element.description})}></Image>
                }
                {element.icon !== undefined &&
                    <Icon iconName={element.icon!}></Icon>
                }
                <div className="title small" style={{flex:1}}>
                    {element.description}
                </div>
                <span  onClick={()=>removeItem(element)}><Icon className="medium delete-selection" iconName={ICONS.CANCEL}></Icon></span>
            </a>;
    }

    const checkChange = () => {
        setIsValid (valueToSet.length <= maxSelections && ((valueToSet.length > 0 && required) || !required));
    }

    return <>
        <div className={`autocomplete-input ${className} ${disabled ? "disabled": ""}`} style={{...style, zIndex: isFocused ? 9999 : 0}}>
            <label htmlFor={fieldName} className={`title semibold small margin-bottom-1mm ${required ? "required" : ""}`} style={{...labelStyle}}>{label}</label>
            <input tabIndex={-1} className="suppressed-input" type="text" name={fieldName} value={(valueToSet ?? []).join(",")} required={required} onChange={checkChange}></input>
            <div style={{position: 'relative'}}>
                <div className="input-container horizontal-list flex-vertical-center rounded-s margin-bottom-1mm">
                    {selectedValues?.map ((element, index) => renderSelected(element, index))}
                    {
                        selectedIds.length < maxSelections && (
                            <input
                                ref={inputRef}
                                className={`input-field title ${!isValid ? "danger" : ""}`}
                                style={{...inputStyle}}
                                placeholder={placeholder ?? ""}
                                type="text"
                                disabled={disabled || (paramRequired && !param)}
                                onChange={onSearchTextChange}
                                onFocus={()=>setIsFocused (true)}
                                onBlur={onBlur}
                                value={searchInput}
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
                    <div tabIndex={0} className="search-result-container rounded-m" style={{position:'absolute',marginTop:"5px",flexDirection:'column',width:"100%",maxHeight: "250px",overflowY: "auto",}}>
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
    </>
}