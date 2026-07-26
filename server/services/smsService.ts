// Mock SMS Service for Twilio/Infobip integration
export class SmsService {
  /**
   * Sends an appointment reminder to a patient.
   */
  static async sendAppointmentReminder(phoneNumber: string, appointmentDetails: string) {
    console.log(`[SMS Gateway] Sending SMS to ${phoneNumber}...`);
    console.log(`[SMS Content]: Your appointment is confirmed: ${appointmentDetails}`);
    
    // TODO: Implement actual Twilio/Infobip SDK here when keys are provided.
    // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `Your appointment is confirmed: ${appointmentDetails}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
    
    return { success: true, messageId: 'mock-id-' + Date.now() };
  }

  /**
   * Sends a daily pill reminder to a patient.
   */
  static async sendPillReminder(phoneNumber: string, pillName: string, timeOfDay: string) {
    console.log(`[SMS Gateway] Sending Pill Reminder to ${phoneNumber}...`);
    console.log(`[SMS Content]: SwasthyaMitra Reminder: It's time to take your ${pillName} for the ${timeOfDay}.`);
    
    return { success: true, messageId: 'mock-id-' + Date.now() };
  }
}
