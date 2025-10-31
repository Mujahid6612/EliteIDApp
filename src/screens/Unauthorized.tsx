import HeaderLayout from "../components/HeaderLayout";
import ThemedText from "../components/ThemedText";

interface UnauthorizedProps {
  message?: string;
}
const Unauthorized = ({ message }: UnauthorizedProps) => {
  const testApi = async () => {
    try {
      const res = await fetch("/api/hello");
      const data = await res.json();
      alert(data.message || "Hello world");
    } catch (e) {
      alert("Failed to call API");
    }
  };
  return (
    <>
      <HeaderLayout screenName="Unauthorized" />
      <div
        className="d-flex-cen "
        style={{ height: "80vh", flexDirection: "column", gap: "30px" }}
      >
        {message ? (
          <ThemedText themeText={message} classPassed="centertext" />
        ) : (
          <div>
            <ThemedText
              themeText="Sorry. You are not authorized to view this job. .. "
              classPassed="centertext"
            />
            <ThemedText themeText="......." classPassed="centertext" />
            <ThemedText
              themeText="You may close this browser  window now."
              classPassed="centertext"
            />
          </div>
        )}
        <div className="divider"></div>
        <button className="button primary" onClick={testApi}>
          Test API
        </button>
      </div>
    </>
  );
};

export default Unauthorized;