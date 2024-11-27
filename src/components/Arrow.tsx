const Arrow = () => {
    return (
      <>
      <div style={{margin: "10px 0"}}>
        <div style={{
          width: "2px",
          height: "50px",
          margin: "0 9px",

          backgroundColor: "black", 
        }}></div>
        <div style={{
          margin: "0 5px",
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "10px solid black", 
        }}></div>
             </div> 
      </>
    );
  }
  
  export default Arrow;
  