interface ThemedListProps {
  list : string[]
}

const ThemedList = ({list}: ThemedListProps) => {
  return (
    <ul className="themed-list">
      {list.map((item, index) => {
        return <li key={index}><span className="step">Step {index+1}:</span> {item}</li>
      })}
    </ul>
  );

};

export default ThemedList;
