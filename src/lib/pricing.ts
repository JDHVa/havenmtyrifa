import { TICKETS } from '../config'

export const orderTotal = (count: number) =>
  Math.floor(count / TICKETS.promo.qty) * TICKETS.promo.price + (count % TICKETS.promo.qty) * TICKETS.price

export const ticketShare = (groupSize: number) => orderTotal(groupSize) / Math.max(1, groupSize)
