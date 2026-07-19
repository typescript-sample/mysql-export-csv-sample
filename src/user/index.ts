import { FixedLengthAttributes } from "onecore"

export interface User {
  id: string
  username: string
  email?: string
  phone?: string
  status?: boolean
  createdDate?: string
}

export const userModel: FixedLengthAttributes = {
  id: {
    key: true,
    length: 11,
  },
  username2: {
    length: 10,
    required: true,
    column: "username",
  },
  email: {
    length: 31,
  },
  phone: {
    length: 20,
  },
  status: {
    length: 5,
    type: "boolean",
  },
  createdDate: {
    length: 10,
    type: "date",
  },
}
