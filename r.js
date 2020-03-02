const fs = require("fs")
const path = require("path")
const stripe = require("./index")("sk_test_")
const filePath = path.join(__dirname, "/mtest/customer-response")
console.log(filePath)

const user = {
  email: "indrajit@logic-square.com",
  cards: ["tok_visa", "tok_visa_debit", "tok_mastercard"]
}

function rmDir(dirPath) {
  let files
  try { files = fs.readdirSync(dirPath) } catch (e) { return }
  if (files.length > 0) {
    for (let i = 0; i < files.length; i += 1) {
      const tfilePath = `${dirPath}/${files[i]}`
      if (fs.statSync(tfilePath).isFile()) fs.unlinkSync(tfilePath)
      else { rmDir(tfilePath) }
    }
  }
  fs.rmdirSync(dirPath)
}

// create customer
async function ccus() {
  try {
    const resp = await stripe.customerCreate(user.email)
    fs.writeFileSync(`${filePath}/ccus.json`, JSON.stringify(resp))
    console.log("Customer Created!")
  } catch (err) {
    console.log(err.message)
  }
}
// add card
async function acard(num = 0) {
  try {
    const card = user.cards[num]
    const customer = JSON.parse(fs.readFileSync(`${filePath}/ccus.json`))
    const resp = await stripe.addCustomerCard(customer.id, card)
    const count = fs.readdirSync(`${filePath}`).filter(el => /acard/i.test(el)).length + 1
    fs.writeFileSync(`${filePath}/acard-${card}-${count}.json`, JSON.stringify(resp))
    console.log("Card added!")
  } catch (err) {
    console.log(err.message)
  }
}
// delete customer
async function dcus() {
  try {
    const customer = JSON.parse(fs.readFileSync(`${filePath}/ccus.json`))
    const resp = await stripe.customerDelete(customer.id)
    fs.writeFileSync(`${filePath}/dcus.json`, JSON.stringify(resp))
    console.log("Customer deleted!")
  } catch (err) {
    console.log(err.message)
  }
}

// fetch cards
async function fcard() {
  try {
    const customer = JSON.parse(fs.readFileSync(`${filePath}/ccus.json`))
    const resp = await stripe.fetchCustomerCards(customer.id)
    const count = fs.readdirSync(`${filePath}`).filter(el => /fcard/i.test(el)).length + 1
    fs.writeFileSync(`${filePath}/fcard-${count}.json`, JSON.stringify(resp))
    console.log("Fetched cards!")
  } catch (err) {
    console.log(err.message)
  }
}
// delete card
async function dcard(num = 0) {
  try {
    const customer = JSON.parse(fs.readFileSync(`${filePath}/ccus.json`))
    const cardFilePath = fs.readdirSync(`${filePath}`).filter(el => /acard/i.test(el))[num]
    const card = JSON.parse(fs.readFileSync(`${filePath}/${cardFilePath}`))
    const resp = await stripe.deleteCustomerCard(customer.id, card.id)
    const count = fs.readdirSync(`${filePath}`).filter(el => /dcard/i.test(el)).length + 1
    fs.writeFileSync(`${filePath}/dcard-${count}.json`, JSON.stringify(resp))
    const renamePath = `${filePath}/${cardFilePath.split(".")[0]}-del.${cardFilePath.split(".")[1]}`
    fs.renameSync(`${filePath}/${cardFilePath}`, renamePath)
    console.log("Delete card! => ", card.id)
  } catch (err) {
    console.log(err.message)
  }
}
// get default
async function gdcard() {
  try {
    const customer = JSON.parse(fs.readFileSync(`${filePath}/ccus.json`))
    const resp = await stripe.getDefaultCustomerCard(customer.id)
    console.log("Default card! =>", resp)
  } catch (err) {
    console.log(err.message)
  }
}
// set default
async function sdcard(num = 0) {
  try {
    const customer = JSON.parse(fs.readFileSync(`${filePath}/ccus.json`))
    const cardFilePath = fs.readdirSync(filePath).filter(el => el.includes("acard") && !el.includes("del"))[num]
    const card = JSON.parse(fs.readFileSync(`${filePath}/${cardFilePath}`))
    const resp = await stripe.setDefaultCustomerCard(customer.id, card.id)
    console.log("Changed Default card! =>", resp)
  } catch (err) {
    console.log(err.message)
  }
}
// payment

// refund

// clear data
async function cldata() {
  try {
    rmDir(filePath)
    fs.mkdirSync(filePath)
    console.log("Data cleared")
  } catch (err) {
    console.log(err.message)
  }
}

(async function () {
  await cldata()
  await ccus()
  await acard(0)
  await acard(1)
  await acard(2)
  await fcard()
  await dcard()
  await gdcard()
  await sdcard()
  await gdcard()
  await sdcard(1)
  await fcard()
  await dcus()
}())
