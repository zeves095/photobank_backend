const NumberHalfWidthWidget = function(props){
  return (
    <input type="number" className="input-number-half-width-widget" value={props.value} onChange={(e) => props.onChange(e.target.value)} />
  );
}

export default NumberHalfWidthWidget;
