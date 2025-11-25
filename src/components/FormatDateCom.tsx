

interface Props {
  datePassed?: string
}
const FormatDateCom = ({datePassed }: Props) => {
  // Add spacing between date and time
  const dateString = datePassed || "";
  
  if (!dateString) {
    return <p className="secoundaru-text"></p>;
  }

  // Function to remove seconds from time string
  const removeSeconds = (timeStr: string): string => {
    // Handle formats like "HH:MM:SS" or "HH:MM:SS AM/PM" or "HH:MM:SS.xxx"
    // Pattern: match HH:MM:SS (with optional .xxx for milliseconds) and optional AM/PM
    // Replace with HH:MM (keeping AM/PM if present)
    return timeStr.replace(/(\d{1,2}:\d{2}):\d{2}(?:\.\d+)?(\s*(?:AM|PM|am|pm))?/gi, (match, timeWithoutSec, ampm) => {
      return timeWithoutSec + (ampm || '');
    });
  };

  // Split by space to separate date and time
  const parts = dateString.trim().split(/\s+/);
  
  if (parts.length >= 2) {
    // First part is date, rest is time
    const datePart = parts[0];
    const timePart = removeSeconds(parts.slice(1).join(" "));
    
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
    const timePart = removeSeconds(dateTimeMatch[3]);
    return (
      <p className="secoundaru-text" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <span>{dateTimeMatch[1]}</span>
        <span>{timePart}</span>
      </p>
    );
  }
  
  // Fallback: try to remove seconds from the entire string if it looks like a time
  const processedString = removeSeconds(dateString);
  return <p className="secoundaru-text">{processedString}</p>;
}

export default FormatDateCom
