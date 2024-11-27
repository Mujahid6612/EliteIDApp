

interface Props {
  datePassed?: string
}
const FormatDateCom = ({datePassed }: Props) => {
  return (
    <p className="secoundaru-text">{datePassed}</p>
  )
}

export default FormatDateCom
