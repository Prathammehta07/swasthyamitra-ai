const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/sehatsetu").then(async () => {
  const Slot = mongoose.model("Slot", new mongoose.Schema({ status: String, patientId: mongoose.Schema.Types.Mixed, isBooked: Boolean, doctorId: mongoose.Schema.Types.ObjectId }));
  const PatientAppt = mongoose.model("PatientAppointment", new mongoose.Schema({ status: String, patientId: mongoose.Schema.Types.Mixed, slotId: mongoose.Schema.Types.Mixed, doctorId: mongoose.Schema.Types.ObjectId }));
  const PatientUser = mongoose.model("PatientUser", new mongoose.Schema({ name: String, email: String }));
  const Patient = mongoose.model("Patient", new mongoose.Schema({ name: String, email: String, doctorId: mongoose.Schema.Types.ObjectId, age: Number, gender: String, phone: String, address: String }));
  
  const patientUsers = await PatientUser.find().lean();
  const appointments = await PatientAppt.find().lean();
  
  let fixedSlotsCount = 0;
  
  for (const appt of appointments) {
     const pu = patientUsers.find(p => p._id.toString() === appt.patientId.toString());
     if (pu) {
        // Correctly find the patient FOR THIS SPECIFIC DOCTOR
        let docPat = await Patient.findOne({ email: pu.email, doctorId: appt.doctorId });
        
        if (!docPat) {
           console.log(`Creating DoctorPatient for ${pu.email} under doctor ${appt.doctorId}`);
           docPat = await Patient.create({ 
               name: pu.name, 
               email: pu.email, 
               age: pu.age || 25, 
               gender: pu.gender || 'other', 
               phone: pu.phone || '1234567890', 
               address: pu.address || 'Unknown', 
               doctorId: appt.doctorId 
           }); 
        }
        
        if (appt.slotId) {
            const slot = await Slot.findById(appt.slotId);
            if (slot) {
                // If the slot's patientId is wrong (points to the other doctor's patient record) or missing
                if (!slot.patientId || slot.patientId.toString() !== docPat._id.toString()) {
                    slot.patientId = docPat._id;
                    await slot.save();
                    fixedSlotsCount++;
                }
            }
        }
     }
  }
  
  console.log("Fixed " + fixedSlotsCount + " slots with correct doctor-specific patient records");
  process.exit(0);
}).catch(console.error);
