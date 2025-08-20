const mongoose = require('mongoose');
// const User = require('@models/User');
const Schema = mongoose.Schema;

const resumeSchema = Schema({
    userId:{type:mongoose.ObjectId, require:true},
    title:{type:String, required:true},
    totalCount: {type: Number, default:0},
    Score: {type: Number},

    sessions:[{
            key:{type:String},
            items:[{
                title:{type:String, require:true},
                text:{type:String, require:true},
                startDate:{type:String},
                endDate:{type:String},
                review:{type:String}
            }],
            title:{type:String, required:true},
            wordCount:{type:Number,default:0}
        }]
},{timestamps:true});
resumeSchema.methods.toJSON = function(){
    const obj = this._doc;
    delete obj.__v;
    return obj;
}

const Resume = mongoose.model("Resume",resumeSchema);
module.exports= Resume;