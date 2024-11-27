
interface ThemedTextProps {
    themeText: string
    classPassed: "lefttext" | "righttext" | "centertext"
}

const ThemedText = ({themeText, classPassed}:ThemedTextProps ) => {
  return (
    <p className={classPassed}>{themeText}</p>
  )
}

export default ThemedText