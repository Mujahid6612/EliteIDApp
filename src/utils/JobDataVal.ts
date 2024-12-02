export const getValueFromData = (data: any, key: string) => {
  const index = data?.JMetaData?.Headings.findIndex(
    (heading: string[]) => heading[0] === key
  );

  if (index !== undefined && index >= 0) {
    return data?.JData?.[0]?.[index] || `No data for ${key}`;
  }

  return null;
};
export const getButtonLabelFromData = (data: any, key: string) => {
  const index = data?.JMetaData?.Headings.findIndex(
    (heading: string[]) => heading[0] === key
  );
  if (index !== undefined && index >= 0) {
    return data?.JMetaData?.Headings[index][1]; 
  }

  return null;
};


export const getJobDetails = (data: any) => {
  return {
    jobOffer: getValueFromData(data, "p_CT_RES_STATUS"),
    jobIdFromRes: getValueFromData(data, "p_CT_RESERVATION_NUM"),
    jobNumber: getValueFromData(data, "p_CT_JOB_NUM") || "",
    reservationDateTime: getValueFromData(data, "p_CT_RESERVATION_DATE_TIME"),
    pickupAddress: getValueFromData(data, "p_CT_PU_FULLADDRESS"),
    dropoffAddress: getValueFromData(data, "p_CT_DO_FULLADDRESS"),
    passengerName: getValueFromData(data, "p_CT_PASSENGER_NAME"),
    passengerPhone: getValueFromData(data, "p_CT_PASSENGER_PHONE_NUM"),
    passengerNameHeading: getValueFromData(data, "p_CT_PASSENGER_NAME"),
    passengerPhoneHeading: getValueFromData(data, "p_CT_PASSENGER_PHONE_NUM"),

    showButtonAccept: getButtonLabelFromData(data, "p_SHOW_BTN_ACCEPT"),
    showButtonReject: getButtonLabelFromData(data, "p_SHOW_BTN_REJECT"),
    showButtonClose: getButtonLabelFromData(data, "p_SHOW_BTN_CLOSE"),
    showButtonArrive: getButtonLabelFromData(data, "p_SHOW_BTN_ARRIVE"),
    showButtonStart: getButtonLabelFromData(data, "p_SHOW_BTN_START"),
    showButtonAddStop: getButtonLabelFromData(data, "p_SHOW_BTN_ADD_STOP"),
    showButtonEnd: getButtonLabelFromData(data, "p_SHOW_BTN_END"),
    showButtonSave: getButtonLabelFromData(data, "p_SHOW_BTN_SAVE"),
  };
};
