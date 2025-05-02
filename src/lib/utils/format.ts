export const transform = {
  textByLine: (paragraph: string, length: number) => {
    const regex = new RegExp(`.{1,${length}}(?:\\s|$)`, 'g')
    return paragraph.match(regex)?.map((line) => line.trim())
  },
  stagger: (idx: number, len: number, target: number | undefined = 0.5) => {
    const scaleFactor = target / (len - 1)
    return idx * scaleFactor
  },
}
