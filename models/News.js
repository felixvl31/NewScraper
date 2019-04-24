var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var NewSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  body:{
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  },
  image:{
    type: String,
    required: true
  },
  saved:{
    type:Boolean,
    default:false
  },
    createdAt:{
    type:Date,
    default:Date.now
  },
  note: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

// This creates our model from the above schema, using mongoose's model method
var News = mongoose.model("News", NewSchema);

// Export the News model
module.exports = News;
