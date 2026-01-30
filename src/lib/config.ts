export interface CompanyInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
}

export interface AppConfig {
    locale: string;
    currency: string;
    companyInfo: CompanyInfo;
}

export const APP_CONFIG: AppConfig = {
    locale: "en-IN",
    currency: "INR",
    companyInfo: {
        name: "V Horizon Properties",
        address: "Shop no G-03, La Gracia Mall, Crossings Republik, Ghaziabad, Uttar Pradesh",
        phone: "+91 9217564977",
        email: "vhorizonproperties@gmail.com",
    },
};
