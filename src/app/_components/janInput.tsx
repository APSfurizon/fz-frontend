import { CSSProperties, useState } from "react";
import "../styles/components/input.css";
import Icon, { ICONS } from "./icon";
import Button from "./button";

export default function JanInput ({iconName,title="",value="",setValue,isNumber,isPassword, style,headerStyle,inputStyle,className, busy,disabled,hasError}: Readonly<{
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
    busy?: boolean,
   // onClick?: React.MouseEventHandler,
    disabled?: boolean;
    hasError?: boolean;
  }>) {
    const [inputValue, setInputValue] = useState(value);

    const [debugDisabled, setDebugDisabled] = useState(false);
    const [debugWait,setDebugWait] = useState(false);
    const [debugError, setDebugError] = useState(false);
    const [debugPassword, setDebugPassword] = useState(false);
    
    const [visiblePassword,setVisiblePassword] = useState(false);
    
    
    const iconPresent = iconName != undefined;
    
    const handleChange = (e:any) => {
        setInputValue(e.target.value);
        setValue && setValue(e.target.value);
    };
    return (
        <div className={`custom-input ${className}`} style={{...style}}>
            <div className="margin-bottom-1mm" style={{...headerStyle,position:'relative'}}>
                <span>{title}</span>
                <span style={{position:'absolute',right:0,top:0,flexDirection:'row',flex:1,display: 'flex'}}>
                    <Button onClick={()=>setDebugPassword(!debugPassword)} style={{background:'yellow'}}></Button>
                    <Button onClick={()=>setDebugDisabled(!debugDisabled)} style={{background:'gray'}}></Button>
                    <Button onClick={()=>setDebugWait(!debugWait)} style={{background:'#fff'}}></Button>
                    <Button onClick={()=>setDebugError(!debugError)} className={'danger'}></Button>
                </span>
            </div>
            <div className="margin-bottom-1mm" style={{...headerStyle,position:'relative'}}>
                <input
                    className={"input-field rounded-s" + " " + (className ?? "") + (hasError||debugError ? "danger" : "")}
                    style={{...inputStyle, paddingRight: iconPresent ? '0.5em' : 'revert',height:"40px",width:'100%'}}
                    type={isNumber?"number":(((isPassword||debugPassword)&&!visiblePassword)?"password":"text")}
                    id="input-field"
                    disabled={disabled||debugDisabled}
                    value={inputValue}
                    onChange={handleChange}
                />
                {(busy||debugWait) && (
                    <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY} style={{position:'absolute',top:10,right:10}}></Icon>
                )}
                {!(busy||debugWait) && (isPassword||debugPassword) && (
                    <span style={{position:'absolute',top:10,right:10,cursor:'pointer'}} onClick={()=>setVisiblePassword(!visiblePassword)}><Icon className="medium" iconName={visiblePassword?ICONS.VISIBILITY:ICONS.VISIBILITY_OFF}></Icon></span>
                )}
            </div>
        </div>
    )
}