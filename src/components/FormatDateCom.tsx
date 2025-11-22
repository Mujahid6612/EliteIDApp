

interface Props {
  datePassed?: string
}
const FormatDateCom = ({datePassed }: Props) => {
  // Add spacing between date and time
  const dateString = datePassed || "";
  
  if (!dateString) {
    return <p className="secoundaru-text"></p>;
  }

  // Split by space to separate date and time
  const parts = dateString.trim().split(/\s+/);
  
  if (parts.length >= 2) {
    // First part is date, rest is time
    const datePart = parts[0];
    const timePart = parts.slice(1).join(" ");
    
    return (
      <p className="secoundaru-text" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <span>{datePart}</span>
        <span>{timePart}</span>
      </p>
    );
  }
  
  // If we can't split, try to find date pattern (e.g., "22-NOV-25") and time pattern
  const dateTimeMatch = dateString.match(/^(.+?)(\s+)(.+)$/);
  if (dateTimeMatch) {
    return (
      <p className="secoundaru-text" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <span>{dateTimeMatch[1]}</span>
        <span>{dateTimeMatch[3]}</span>
      </p>
    );
  }
  
  // Fallback: return as is
  return <p className="secoundaru-text">{dateString}</p>;
}

export default FormatDateCom
