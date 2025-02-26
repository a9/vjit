export class Logger {
  label: string
  constructor(label: string) {
    this.label = label
  }

  warn(...data: any[]) {
    const message = data.join(' ')

    console.log(
      `%c ${this.label} %c ${message} %c`,
      'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
      'background:#d7a700 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
      'background:transparent',
    )
  }

  success(...data: any[]) {
    const message = data.join(' ')

    console.log(
      `%c ${this.label} %c ${message} %c`,
      'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
      'background:#62c354 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
      'background:transparent',
    )
  }

  log(...data: any[]) {
    const message = data.join(' ')

    console.log(
      `%c ${this.label} %c ${message} %c`,
      'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
      'background:#469be9 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
      'background:transparent',
    )
  }
}
