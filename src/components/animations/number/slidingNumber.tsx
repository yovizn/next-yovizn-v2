import { Digit } from './digit.number'

type SlidingNumberProps = {
  value: number
  padStart?: boolean
  decimalSeparator?: string
  decimal?: boolean
}

export function SlidingNumber({
  value,
  padStart = false,
  decimalSeparator = '.',
  decimal = false,
}: SlidingNumberProps) {
  const absValue = !decimal ? Math.abs(value) : value
  const [integerPart, decimalPart] = absValue.toString().split('.')
  const integerValue = parseInt(integerPart, 10)
  const paddedInteger = padStart && integerValue < 10 ? `0${integerPart}` : integerPart
  const integerDigits = paddedInteger.split('')
  const integerPlaces = integerDigits.map((_, i) => Math.pow(10, integerDigits.length - i - 1))

  return (
    <div className="flex items-center">
      {value < 0 && '-'}
      {integerDigits.map((_, index) => (
        <Digit
          key={`pos-${integerPlaces[index]}`}
          value={integerValue}
          place={integerPlaces[index]}
        />
      ))}
      {decimalPart && (
        <>
          <span>{decimalSeparator}</span>
          {decimalPart.split('').map((_, index) => (
            <Digit
              key={`decimal-${index}`}
              value={parseInt(decimalPart, 10)}
              place={Math.pow(10, decimalPart.length - index - 1)}
            />
          ))}
        </>
      )}
    </div>
  )
}
