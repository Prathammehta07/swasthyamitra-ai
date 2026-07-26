const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/sehatsetu").then(async () => {
  const Slot = mongoose.model("Slot", new mongoose.Schema({ status: String, patientId: mongoose.Schema.Types.Mixed, isBooked: Boolean, doctorId: mongoose.Schema.Types.ObjectId }));
  const PatientAppt = mongoose.model("PatientAppointment", new mongoose.Schema({ status: String, patientId: mongoose.Schema.Types.Mixed, slotId: mongoose.Schema.Types.Mixed }));
  
  const appointments = await PatientAppt.find().lean();
  let updatedCount = 0;
  for (const appt of appointments) {
     if (appt.slotId) {
        const slot = await Slot.findById(appt.slotId);
        if (slot && slot.status !== appt.status) {
            slot.status = appt.status;
            if (appt.status === "completed" || appt.status === "booked" || appt.status === "scheduled") {
               slot.isBooked = true;
            } else {
               slot.isBooked = false;
               slot.patientId = undefined;
            }
            await slot.save();
            updatedCount++;
        }
     }
  }
  console.log("Fixed status for " + updatedCount + " slots");
  process.exit(0);
}).catch(console.error);
