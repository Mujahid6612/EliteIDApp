
interface MainMessageProps {
    title: string
}

const MainMessage = ({title}: MainMessageProps) => {
  return (
    <h1>{title}</h1>
  )
}

export default MainMessage