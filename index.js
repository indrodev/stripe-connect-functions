const Stripe = require("stripe")

module.exports = (stripeSecretKey) => {
  const stripe = Stripe(stripeSecretKey)
  return {
    async customerCreate(email = null) {
      try {
        return await stripe.customers.create({ email })
      } catch (err) {
        // istanbul ignore next
        throw err
      }
    },

    async customAccountCreate(email = null) {
      try {
        return await stripe.accounts.create({
          country: "US",
          type: "custom",
          email,
        })
      } catch (err) {
        // istanbul ignore next
        throw err
      }
    },

    async fetchCustomerCards(stripeCustomerId) {
      try {
        const result = await Promise.all([
          await stripe.customers.listCards(stripeCustomerId),
          await stripe.customers.retrieve(stripeCustomerId)
        ])
        const { data } = result[0]
        const { default_source } = result[1] // eslint-disable-line camelcase
        return data.map(card => Object.assign(card, {
          isDefault: (card.id === default_source) // eslint-disable-line camelcase
        }))
      } catch (err) {
        // istanbul ignore next
        throw err
      }
    },

    async addCustomerCard(stripeCustomerId, stripeToken) {
      try {
        return await stripe.customers.createSource(stripeCustomerId, {
          source: stripeToken
        })
      } catch (err) {
        // istanbul ignore next
        throw err
      }
    },

    async deleteCustomerCard(stripeCustomerId, cardId) {
      try {
        return await stripe
          .customers
          .deleteCard(stripeCustomerId, cardId)
      } catch (err) {
        // istanbul ignore next
        throw err
      }
    },

    async getDefaultCustomerCard(stripeCustomerId) {
      try {
        const {
          default_source // eslint-disable-line camelcase
        } = await stripe.customers.retrieve(stripeCustomerId)
        return default_source // eslint-disable-line camelcase
      } catch (err) {
        // istanbul ignore next
        throw err
      }
    },

    async setDefaultCustomerCard(stripeCustomerId, stripeCardId) {
      try {
        const {
          default_source // eslint-disable-line camelcase
        } = await stripe.customers.update(stripeCustomerId, { // eslint-disable-line camelcase
          default_source: stripeCardId
        })
        return default_source // eslint-disable-line camelcase
      } catch (err) {
        // istanbul ignore next
        throw err
      }
    },

    async setVendorBankAccount(stripeAccountId, {
      routingNo,
      accountNo,
      accountHolderName = null
    }) {
      try {
        const accountObj = {
          object: "bank_account",
          country: "US",
          currency: "usd",
          account_number: accountNo,
          routing_number: routingNo,
        }
        if (accountHolderName !== null) {
          accountObj.account_holder_name = accountHolderName
        }
        return await stripe.accounts.update(stripeAccountId, {
          external_account: accountObj
        })
      } catch (err) {
        // istanbul ignore next
        throw err
      }
    },

    async vendorKyc(stripeAccountId, {
      address = {},
      dob = {},
      name = {},
      ssnLastFour = null,
      fullSsn = null
    }) {
      try {
        const entityObj = {
          address,
          dob,
          first_name: name.first,
          last_name: name.last,
          type: "individual"
        }
        if (ssnLastFour !== null) entityObj.ssn_last_4 = ssnLastFour
        if (fullSsn !== null) entityObj.personal_id_number = fullSsn
        return await stripe.accounts.update(stripeAccountId, {
          legal_entity: entityObj
        })
      } catch (err) {
        // istanbul ignore next
        throw err
      }
    },

    async vendorAcceptTos(stripeAccountId, {
      tosAcceptanceDate,
      tosAcceptanceIp,
      tosUserAgent = null
    }) {
      try {
        const tosObj = {
          date: tosAcceptanceDate,
          ip: tosAcceptanceIp,
        }
        if (tosUserAgent !== null) tosObj.user_agent = tosUserAgent
        return await stripe.accounts.update(stripeAccountId, {
          tos_acceptance: tosObj
        })
      } catch (err) {
        // istanbul ignore next
        throw err
      }
    },

    async initiatePayment({
      customer,
      vendor,
      amount,
      vendorAmount,
      currency,
      receiptEmail = null,
      description = null,
      statementDescriptor = null,
      capture = false
    }) {
      try {
        return await stripe.charges.create({
          capture,
          customer,
          amount: amount * 100, // convert to cents from dollar
          currency,
          description,
          receipt_email: receiptEmail,
          statement_descriptor: statementDescriptor,
          destination: {
            amount: vendorAmount,
            account: vendor,
          }
        })
      } catch (err) {
        // istanbul ignore next
        throw err
      }
    },

    async capturePayment(
      transactionId,
      vendorAmount = null,
      statementDescriptor = null
    ) {
      try {
        const objToCapture = {}
        if (statementDescriptor !== null) {
          objToCapture.statement_descriptor = statementDescriptor
        }
        if (vendorAmount !== null) { // Update amount payable to Vendor; otherwise send the initiated amount
          objToCapture.destination = {
            amount: vendorAmount * 100, // convert to cents from dollar
          }
        }
        return await stripe.charges.capture(transactionId, objToCapture)
      } catch (err) {
        // istanbul ignore next
        throw err
      }
    }
  }
}
