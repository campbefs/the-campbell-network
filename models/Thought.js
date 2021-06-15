const { Schema, model } = require('mongoose');
const reactionSchema = require('./Reaction');
const dateFormat = require('../utils/dateFormat');

const ThoughtSchema = new Schema(
  {
    thoughtText: {
      type: String,
      required: [true, 'Text  field is required'],
      min: 1,
      max: 280
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: createdAtVal => dateFormat(createdAtVal)
    },
    username: {
      type: String,
      required: [true, 'Username is required']
    },
    reactions: [reactionSchema] // created schema and passed it
  },
  {
    toJSON: {
      virtuals: true,
    },
    id: false
  }
)

ThoughtSchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
})

const Thought = model('Thought', ThoughtSchema);

module.exports = Thought;
