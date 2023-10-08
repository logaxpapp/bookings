/**
 * @typedef {import("./namedStyles").NamedStyle} NamedStyle
 */

/**
 * @typedef { Object } Image
 * @property { number } id
 * @property { string } url
 */

/**
 * @typedef { Object } Country
 * @property {number} id
 * @property {string} name
 * @property {string} code
 * @property {string} currency
 * @property {string} currencySymbol
 * @property {string} currencyCode
 */

/**
 * @typedef Company
 * @property {number} id
 * @property { string } name
 * @property { string } address
 * @property { string } phoneNumber
 * @property {Country} country
 */

/**
 * @typedef { Object } Service
 * @property { number } id
 * @property { string } name
 * @property { number } price
 * @property { number } duration
 * @property { number } minDeposit
 * @property { number } categoryId
 * @property { Array<Image> } images
 * @property { Company } company
 */

/**
 * @typedef User
 * @property { number } id
 * @property { string } name
 * @property { string } email
 * @property { string } firstname
 * @property { string } lastname
 * @property { string } phoneNumber
 */

/**
 * @typedef TimeSlot
 * @property { number } id
 * @property { string } time
 * @property { Service } service
 */

/**
 * @typedef { Object } Correspondence
 * @property { number } id
 * @property { string } title
 * @property { string } content
 * @property { number } senderId
 * @property { string } senderType
 * @property { number } referenceId
 * @property { string } referenceType
 */

/**
 * @typedef { Object } Appointment
 * @property { number } id
 * @property { User } customer
 * @property { TimeSlot } timeSlot
 * @property { string } deposit
 * @property { string } status
 * @property {Array<Correspondence>} messages
 */

export default {};
