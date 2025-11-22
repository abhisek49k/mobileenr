export const compressTruckCert = (truck: any) => ({
  // Truck Details
  td: {
    mk: truck.truck_make,     // Make
    md: truck.truck_model,    // Model
    y: truck.truck_year,      // Year
    c: truck.truck_color,     // Color
    tn: truck.tag_number,     // Tag #
    sb: truck.has_sideboards, // Sideboards
  },

  // Driver/Owner Details
  dr: {
    fn: truck.driver_first_name,  // First Name
    ln: truck.driver_last_name,   // Last Name
    co: truck.driver_company_name, // Company
    ph: truck.driver_phone,       // Phone
    em: truck.driver_email,       // Email
    st: truck.license_state,      // License State
    le: truck.license_expiration_date, // Expiration Date
    ow: truck.is_driver_owner,     // Owner?
  },

  // Vehicle Type
  tp: truck.truck_type_selector, // e.g. "dump_truck"
});
