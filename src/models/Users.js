const mongoose = require("mongoose");
const Counter = require("./Counter");


// Helper function to check age >= 18
const isAdult = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 18;
};

const userSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [2, "First name must be at least 8 characters"],
      maxlength: [12, "First name must not exceed 12 characters"],
      trim: true
    },

    middleName: {
      type: String,
      required: [true, "Middle name is required"],
      minlength: [2, "Middle name must be at least 8 characters"],
      maxlength: [12, "Middle name must not exceed 12 characters"],
      trim: true
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [2, "Last name must be at least 8 characters"],
      maxlength: [30, "Last name must not exceed 30 characters"],
      trim: true
    },

    userName: {
      type: String,
      maxlength: [12, "Username must not exceed 12 characters"],
      match: [/^[a-zA-Z0-9]*$/, "Username can only contain letters and numbers"],
      trim: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"]
    },

    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: isAdult,
        message: "User must be at least 18 years old"
      }
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["male", "female"],
        message: "Gender must be either male or female"
      }
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function(next) {
  const counter = await Counter.findOneAndUpdate(
    { name: "userId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.id = counter.seq;
});



/*clean response help us to be 
Versioned APIs
✅ Microservices
✅ Public APIs
✅ SDK generation
✅ Backward compatibility
Reply to the question
We clean API responses to abstract database implementation,
improve security, ensure consistency,
and provide a clean contract between backend and clients.
*/

// Clean API response
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  }
});


module.exports = mongoose.model("User", userSchema);
