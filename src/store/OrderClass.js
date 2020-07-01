import store from './store'

export default class Order {

    constructor (rawData = {}) {

        this.rawData = rawData

        this.orderId = rawData.orderId

        this.date = rawData.date

        this.tableNumber = localStorage.getItem("tableNumber")

        this.orderItems = rawData.orderItems ? this.orders : []

        this.order_total_in_cents = this.total()

    }

    total(){


        let it = this.orderItems;

        let total =  0;

        it.forEach( e => {

            total = total + e.amount * e.price_to_pay_in_cents

        })

        return total



    }

    get orders(){


            let orders = [];

            for(const order of this.rawData.orderItems) {

                orders.push({

                    id: order.id,
                    amount:order.amount,
                    customText: order.customText,
                    imageUrl: order.imageUrl,
                    price_to_pay_in_cents: order.price_to_pay_in_cents,
                    title: order.title,
                    toppings: order.toppings


                })

            }


            return  orders

        }



}