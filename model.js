/*
const userSchema = new mongoose.Schema({
  name: String,
  userid: { type: String, unique: true, required: true },
  password: String,
  role: String,
  base: String,
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

const purchaseSchema = new mongoose.Schema({
  Weapon: String,
  Type: String,
  Quantity: Number,
  PurchaseDate: Date,
  Base: String
},{
  collection: 'purchase'  
});

export const Purchase = mongoose.model('Purchase', purchaseSchema);

export default User;
*/