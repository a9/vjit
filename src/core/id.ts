import { customAlphabet, urlAlphabet } from 'nanoid'

const nanoid = customAlphabet(urlAlphabet.toLowerCase().replace(/[_-]/g, ''))

export const generateId = (size: number = 8) => {
  return nanoid(size)
}
