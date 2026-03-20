
export const validateStaffNo = (staffNo: string) => {
    return /^[EGD][0-9]{3}\/[0-9]{4}\/[0-9]{4}$/.test(staffNo);
  };
  
  export const STAFF_NO_PATTERN = "^[EGD][0-9]{3}/[0-9]{4}/[0-9]{4}$";