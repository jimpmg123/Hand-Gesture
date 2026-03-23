type SectionIntroProps = {
  title: string
  detail: string
}

export function SectionIntro({ title, detail }: SectionIntroProps) {
  return (
    <div className="section-intro">
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
  )
}
