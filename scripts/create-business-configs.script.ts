const mongoose = require('mongoose');
const { Schema } = require('mongoose');

function makeNewConnection(uri) {
  const db = mongoose.createConnection(uri);

  db.on('error', function (error) {
    console.log(`MongoDB :: connection ${this.name} ${JSON.stringify(error)}`);
    db.close().catch(() =>
      console.log(`MongoDB :: failed to close connection ${this.name}`),
    );
  });

  db.on('connected', function () {
    console.log(`MongoDB :: connected ${this.name}`);
  });

  db.on('disconnected', function () {
    console.log(`MongoDB :: disconnected ${this.name}`);
  });

  return db;
}

const BusinessSettings = new Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      required: true,
    },
    deliveryStrategyId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    providersConfig: { type: Object },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'BusinessSettings',
    timestamps: true,
  },
);

const businessSchema = new Schema(
  {
    settings: {
      deliveryBy: {
        type: [
          {
            deliveryService: { type: String, default: 'self' },
            teamId: { type: String, default: null },
            tenantKey: { type: String, default: null },
            nashGroupId: { type: String, default: null },
            freeDeliveryEnabled: { type: Boolean, default: false },
            pickupInstructions: { type: String, default: null },
            setInfoInPickupInstruction: { type: Boolean, default: false },
            maxDeliveryFee: {
              type: Number,
              default: 0,
            },
          },
        ],
      },
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
  },
);

const api01Connection = makeNewConnection(
  '',
);
const dispatchDeliveryConnection = makeNewConnection(
  '',
);

const businessModel = api01Connection.model('Business', businessSchema);
const businessConfigsModel = dispatchDeliveryConnection.model(
  'BusinessSettings',
  BusinessSettings,
);

async function createBusinessConfigs() {
  try {
    const bulkCreateData = [];
    const businesses = await businessModel
      .find(
        { 'settings.deliveryBy': { $ne: [] } },
        { 'settings.deliveryBy': 1 },
      )
      .lean();
    console.log('-------businesses--------', businesses.length);

    for (const business of businesses) {
      const deliveryBy = business.settings.deliveryBy[0];
      bulkCreateData.push({
        businessId: business._id,
        deliveryStrategyId: '6658648885109a7a1ad9f41a',
        providersConfig: {
          nash: {
            nashGroupId: deliveryBy.nashGroupId,
            freeDeliveryEnabled: deliveryBy.freeDeliveryEnabled,
            pickupInstructions: deliveryBy.pickupInstructions,
            setInfoInPickupInstruction: deliveryBy.setInfoInPickupInstruction,
            maxDeliveryFee: deliveryBy.maxDeliveryFee,
          },
          cartwheel: {
            teamId: deliveryBy.teamId,
            tenantKey: deliveryBy.tenantKey,
            freeDeliveryEnabled: deliveryBy.freeDeliveryEnabled,
            pickupInstructions: deliveryBy.pickupInstructions,
            setInfoInPickupInstruction: deliveryBy.setInfoInPickupInstruction,
            maxDeliveryFee: deliveryBy.maxDeliveryFee,
          },
          fetchme: {
            teamId: deliveryBy.teamId,
            tenantKey: deliveryBy.tenantKey,
            freeDeliveryEnabled: deliveryBy.freeDeliveryEnabled,
            pickupInstructions: deliveryBy.pickupInstructions,
            setInfoInPickupInstruction: deliveryBy.setInfoInPickupInstruction,
            maxDeliveryFee: deliveryBy.maxDeliveryFee,
          },
          deliverlogic: {
            teamId: deliveryBy.teamId,
            tenantKey: deliveryBy.tenantKey,
            freeDeliveryEnabled: deliveryBy.freeDeliveryEnabled,
            pickupInstructions: deliveryBy.pickupInstructions,
            setInfoInPickupInstruction: deliveryBy.setInfoInPickupInstruction,
            maxDeliveryFee: deliveryBy.maxDeliveryFee,
          },
          doordash: {
            freeDeliveryEnabled: deliveryBy.freeDeliveryEnabled,
            pickupInstructions: deliveryBy.pickupInstructions,
            setInfoInPickupInstruction: deliveryBy.setInfoInPickupInstruction,
            maxDeliveryFee: deliveryBy.maxDeliveryFee,
          },
          uber: {
            freeDeliveryEnabled: deliveryBy.freeDeliveryEnabled,
            pickupInstructions: deliveryBy.pickupInstructions,
            setInfoInPickupInstruction: deliveryBy.setInfoInPickupInstruction,
            maxDeliveryFee: deliveryBy.maxDeliveryFee,
          },
        },
      });
    }

    await businessConfigsModel.insertMany(bulkCreateData);
    console.log('-----------FINISH------------');
  } catch (error) {
    console.log('---------error-------', error);
  }
}

setTimeout(() => {
  createBusinessConfigs();
}, 1000);
