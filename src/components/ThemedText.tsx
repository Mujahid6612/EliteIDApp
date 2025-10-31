
interface ThemedTextProps {
    themeText: string
    classPassed: "lefttext" | "righttext" | "centertext"
    style?: React.CSSProperties
}

const ThemedText = ({themeText, classPassed, style}:ThemedTextProps ) => {
  return (
    <p className={classPassed} style={style}>{themeText}</p>
  )
}

export default ThemedText