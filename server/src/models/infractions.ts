import mongoose from 'mongoose';

const infractionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  convict: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reporters: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true,
  },
  status: {
    type: String,
    default: 'open',
  },
});

export interface IInfractionSchema {
  project: mongoose.Schema.Types.ObjectId;
  convict: mongoose.Schema.Types.ObjectId;
  reporters: Array<mongoose.Schema.Types.ObjectId>;
  status: 'open' | 'closed';
}

const Infraction = mongoose.model<IInfractionSchema>(
  'Infraction',
  infractionSchema
);
export { Infraction };
