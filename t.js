const fs = require("fs")
const path = require("path")
const stripe = require("./index")("sk_test_")
const filePath = path.join(__dirname, "/mtest/vendor-response")
console.log(filePath)

const user = {
  email: "indrajit@logic-square.com",
  cards: ["tok_visa", "tok_visa_debit", "tok_mastercard"],
  address: {
    city: "Brockton",
    line1: "700 Oak Street",
    line2: "",
    postal_code: "2301",
    state: "MA",
    country: "US"
  },
  dob: {
    day: "6",
    month: "1",
    year: "1975"
  },
  name: {
    first: "Indrajit",
    last: "Roy"
  },
  personalIdNumber: "000000000",
  ssnLastFour: "0000",
  phone: "+12027622401",
  mcc: 5045,
  businessUrl: "www.truefanz.com",
  tosAcceptanceDate: 1582705646,
  tosAcceptanceIp: "182.16.119.65",
  routingNo: "110000000",
  accountNo: "000123456789"
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

// create vendor
async function cven() {
  try {
    const resp = await stripe.vendorCreate(user.email)
    fs.writeFileSync(`${filePath}/cven.json`, JSON.stringify(resp))
    console.log("Vendor Created!")
  } catch (err) {
    console.log(err.message)
  }
}
// delete vendor
async function dven() {
  try {
    const vendor = JSON.parse(fs.readFileSync(`${filePath}/cven.json`))
    const resp = await stripe.vendorDelete(vendor.id)
    fs.writeFileSync(`${filePath}/dven.json`, JSON.stringify(resp))
    console.log("Vendor Deleted!")
  } catch (err) {
    console.log(err.message)
  }
}
// set vendor bank
async function bankven() {
  try {
    const dobj = {
      routingNo: user.routingNo,
      accountNo: user.accountNo
    }
    const vendor = JSON.parse(fs.readFileSync(`${filePath}/cven.json`))
    const resp = await stripe.setVendorBankAccount(vendor.id, dobj)
    fs.writeFileSync(`${filePath}/bankven.json`, JSON.stringify(resp))
    console.log("Vendor Bank added!")
  } catch (err) {
    console.log(err.message)
  }
}
// vendor kyc
async function kycven() {
  try {
    const dobj = {
      address: user.address,
      dob: user.dob,
      name: user.name,
      personalIdNumber: user.personalIdNumber,
      ssnLastFour: user.ssnLastFour,
      email: user.email,
      phone: user.phone,
      mcc: user.mcc,
      businessUrl: user.businessUrl
    }
    const vendor = JSON.parse(fs.readFileSync(`${filePath}/cven.json`))
    const resp = await stripe.vendorKyc(vendor.id, dobj)
    fs.writeFileSync(`${filePath}/kycven.json`, JSON.stringify(resp))
    console.log("Vendor Kyc!")
  } catch (err) {
    console.log(err.message)
  }
}
// vendor accept tos
async function tosven() {
  try {
    const dobj = {
      tosAcceptanceDate: user.tosAcceptanceDate,
      tosAcceptanceIp: user.tosAcceptanceIp
    }
    const vendor = JSON.parse(fs.readFileSync(`${filePath}/cven.json`))
    const resp = await stripe.vendorAcceptTos(vendor.id, dobj)
    fs.writeFileSync(`${filePath}/tosven.json`, JSON.stringify(resp))
    console.log("Vendor TOS!")
  } catch (err) {
    console.log(err.message)
  }
}
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
  await cven()
  await bankven()
  await kycven()
  await tosven()
  // await dven()
}())
