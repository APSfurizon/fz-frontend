import { CSSProperties, useState } from "react";
import "../styles/components/janInput.css";
import Icon, { ICONS } from "./icon";
import Button from "./button";

export default function JanInput ({iconName,title="",value="",setValue,isNumber,isPassword, style,headerStyle,inputStyle,className,placeholder, busy,disabled,hasError}: Readonly<{
    iconName?: string,
    title?: string,
    value?: string,
    setValue?:React.ComponentState,
    isNumber?: boolean,
    isPassword?: boolean,
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
    const [visiblePassword,setVisiblePassword] = useState(false);
    const iconPresent = iconName != undefined;
    
    const handleChange = (e:any) => {
        setInputValue(e.target.value);
        setValue && setValue(e.target.value);
    };
    return (
        <div className={`custom-input ${className}`} style={{...style}}>
            <div className="margin-bottom-1mm" style={{...headerStyle,position:'relative'}}>
                <span className="title semibold">{title}</span>
            </div>
            <div className="margin-bottom-1mm" style={{...headerStyle,position:'relative'}}>
                <input
                    className={"input-field title rounded-s" + " " + (className ?? "") + (hasError? "danger" : "")}
                    style={{...inputStyle, paddingRight: iconPresent ? '0.5em' : 'revert',height:"40px",width:'100%'}}
                    placeholder={placeholder ?? ""}
                    type={isNumber?"number":(((isPassword)&&!visiblePassword)?"password":"text")}
                    id="input-field"
                    disabled={disabled}
                    value={inputValue}
                    onChange={handleChange}
                />
                {(busy) && (
                    <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY} style={{position:'absolute',top:10,right:10}}></Icon>
                )}
                {!(busy) && (isPassword) && (
                    <span style={{position:'absolute',top:10,right:10,cursor:'pointer'}} onClick={()=>setVisiblePassword(!visiblePassword)}><Icon className="medium" iconName={visiblePassword?ICONS.VISIBILITY:ICONS.VISIBILITY_OFF}></Icon></span>
                )}
            </div>
        </div>
    )
}