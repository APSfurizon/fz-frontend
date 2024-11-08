import { CSSProperties, useEffect, useRef, useState } from "react";
import "../styles/components/autoComplete.css";
import Icon, { ICONS } from "./icon";
import Button from "./button";

export default function AutoComplete ({iconName,title="",value="",setValue, style,headerStyle,inputStyle,className,placeholder, busy,disabled,hasError}: Readonly<{
    iconName?: string,
    title?: string,
    value?: string,
    setValue?:React.ComponentState,
    style?: CSSProperties,
    headerStyle?: CSSProperties,
    inputStyle?:CSSProperties,
    className?: string,
    placeholder?: string,
    busy?: boolean,
    disabled?: boolean;
    hasError?: boolean;
  }>) {
    const [inputValue, setInputValue] = useState(value);
    const [isLoading,setIsLoading] = useState(false);
    const [erroreRicerca,setErroreRicerca] = useState(false);
    const iconPresent = iconName != undefined;
    const inputRef = useRef<HTMLInputElement>(null);

    const [inputRicerca,setInputRicerca] = useState(false);

    const _setInput=(e:any)=>{
        e.preventDefault();
        setInputValue("");
        setErroreRicerca(false);
        setInputRicerca(true);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }

    const _aggiungiNome=(e:any)=>{
        setInputValue(e);
        setMyLista([]);
    }

    const _getOne=(element: string,index: number)=>{
        return <div key={index} className="lista-elemento rounded-s" style={{color:'#fff',display:'flex'}} onMouseDown={()=>{_aggiungiNome(element)}}>
            <Icon className="medium" iconName={ICONS.ADD_CIRCLE}></Icon>
            <div className="title" style={{flex:1}}>
                {element}
            </div>
        </div>
    }



    const _onSearchBackend = async (testo:string) => {
        if (!testo) {
            setMyLista([]);
          return;
        }
        setIsLoading(true);setErroreRicerca(false);
        setTimeout(async () => {
            try {
            const response = await fetch(`http://localhost:3001/search?q=${testo}`);
            if (!response.ok) throw new Error("Errore API");
                const data = await response.json();
                setMyLista(data);
            } catch (error) {
                setErroreRicerca(true);
                console.error("Errore ricerca", error);
            } finally {
                setIsLoading(false);
            }
        }, 500); 
      };

    const [isFocused, setIsFocused] = useState(false);
    const [backend,setBackend] = useState(false);
    const [myLista, setMyLista] = useState<string[]>([]);
    const dati = ["Mario","Mariolo","Mario2","Mariolo3","Mario4","Mariolo5","Mario6","Mariolo7","Mario8","Mariolo9","Luigi"];



    const _onSearch = (testo: string) => {
        const result = dati.filter(element => element.toLowerCase().includes(testo));
        console.log(result);
        setMyLista(result);
    }
    const handleChange = (e:any) => {
        const testo = e.target.value;
        setInputValue(testo);
        console.log("TESTO:"+testo);
        if(testo.length>2){
            console.log("TESTO_SEARCHING:"+testo);
            backend?_onSearchBackend(testo.toLowerCase()):_onSearch(testo.toLowerCase());
        }else{
            setMyLista([]);
        }
        //setValue && setValue(e.target.value);
    };


    useEffect(() => {
        if (inputRicerca && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [inputRicerca]);

    return (
        <div className={`custom-input ${className}`} style={{...style}}>
            <div className="margin-bottom-1mm" style={{...headerStyle}}>
                <span className="title semibold">{title}</span>
                {!backend?<span className="descriptive semibold" style={{color:'blue',cursor:'pointer'}} onClick={()=>setBackend(!backend)}>{" press for[ Call Backend ]"}</span>:
                <span className="descriptive semibold" style={{color:'green',cursor:'pointer'}} onClick={()=>setBackend(!backend)}>{" press for[ Existing Data ]"}</span>}
            </div>
            <div style={{...headerStyle,position: 'relative'}}>
                <div onClick={_setInput} className={"lista-bottone rounded-s"} style={{...inputStyle,zIndex:10, paddingRight: iconPresent ? '0.5em' : 'revert',height:"40px",width:'100%',alignItems:'center'}}>
                    <Icon className="medium" iconName={ICONS.EDIT_SQUARE} style={{  pointerEvents: 'none' }}/>
                    <div className="title" style={{flex:1}}>
                        {inputValue?inputValue:"Select a user"}
                    </div>
                    <Icon className="medium" iconName={ICONS.ARROW_DROP_DOWN} style={{  pointerEvents: 'none' }}/>
                </div>
                {inputRicerca && <div style={{position:'absolute',top:0,width:'100%',opacity:inputRicerca?1:1}}>
                    <input
                        ref={inputRef}
                        className={"input-field title rounded-s" + " " + (className ?? "") + (hasError? "danger" : "")}
                        style={{...inputStyle, paddingRight: iconPresent ? '0.5em' : 'revert',height:"40px",width:'100%',zIndex:9}}
                        placeholder={placeholder ?? "Select a user"}
                        type={"text"}
                        id="input-field"
                        disabled={disabled}
                        value={inputValue}
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {setIsFocused(false);setInputRicerca(false);setMyLista([])}}
                    />
                    {iconPresent && (
                        <Icon className="medium" iconName={ICONS.SEARCH} style={{ position: 'absolute', left: '15px', top: '25px', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                    )}
                    {isFocused && myLista.length>0 &&<div className="autoComplete rounded-s" style={{...headerStyle,marginTop:"5px",flexDirection:'column',width:"100%",maxHeight: "250px",overflowY: "auto",}}>
                        {!erroreRicerca?myLista.map((element,index) => {
                            return _getOne(element,index)
                        }):<div>Nessun Elemento Trovato</div>}
                    </div>}
                </div>}
                {(busy||isLoading) && (
                    <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY} style={{position:'absolute',top:10,right:10}}></Icon>
                )}
            </div>
        </div>
    )
}