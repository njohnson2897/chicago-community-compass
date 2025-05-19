const BASE_URL = "https://data.cityofchicago.org/resource";

// Validation and error handling utilities
const validateCoordinates = (latitude, longitude) => {
  if (!latitude || !longitude) return false;
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter((field) => !data[field]);
  if (missingFields.length > 0) {
    console.warn(`Missing required fields: ${missingFields.join(", ")}`);
    return false;
  }
  return true;
};

const formatAddress = (data) => {
  try {
    const parts = [data.address];
    if (data.city) parts.push(data.city);
    if (data.state) parts.push(data.state);
    if (data.zip) parts.push(data.zip);
    return parts.filter(Boolean).join(", ");
  } catch (error) {
    console.error("Error formatting address:", error);
    return data.address || "Address not available";
  }
};

const ENDPOINTS = {
  workforceCenters: {
    url: `${BASE_URL}/cs4s-nsna.json`,
    category: "employment",
    subcategory: "workforce",
    transform: (data) => {
      try {
        // Check for required fields
        const requiredFields = ["site_name", "address", "location"];
        const missingFields = requiredFields.filter((field) => !data[field]);

        if (missingFields.length > 0) {
          console.warn(
            `Missing required fields in workforce data: ${missingFields.join(
              ", "
            )}`
          );
          return null;
        }

        // Get coordinates from location object
        const lat = parseFloat(data.location.latitude);
        const lng = parseFloat(data.location.longitude);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(
            `Invalid coordinates for ${data.site_name}: lat=${lat}, lng=${lng}`
          );
          return null;
        }

        // Format full address
        const fullAddress = `${data.address}, ${data.city}, ${data.state} ${
          data.zip || ""
        }`.trim();

        const transformed = {
          id: data.site_name,
          name: data.site_name,
          description: "Workforce Center",
          address: fullAddress,
          coordinates: [lng, lat],
          hours: data.hours_of_operation || "Hours not available",
          phone: data.phone || "Phone not available",
          website: data.website || null,
          category: "employment",
          subcategory: "workforce",
        };

        return transformed;
      } catch (error) {
        console.error("Error transforming workforce data:", error);
        return null;
      }
    },
  },
  seniorCenters: {
    url: `${BASE_URL}/qhfc-4cw2.json`,
    category: "senior",
    subcategory: "centers",
    transform: (data) => {
      try {
        // Check for required fields
        const requiredFields = ["site_name", "address", "location"];
        const missingFields = requiredFields.filter((field) => !data[field]);

        if (missingFields.length > 0) {
          console.warn(
            `Missing required fields in senior center data: ${missingFields.join(
              ", "
            )}`
          );
          return null;
        }

        // Get coordinates from location object
        const lat = parseFloat(data.location.latitude);
        const lng = parseFloat(data.location.longitude);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(
            `Invalid coordinates for ${data.site_name}: lat=${lat}, lng=${lng}`
          );
          return null;
        }

        // Format full address
        const fullAddress = `${data.address}, ${data.city}, ${data.state} ${
          data.zip || ""
        }`.trim();

        return {
          id: data.site_name,
          name: data.site_name,
          description: data.program || "Senior Center",
          category: "senior",
          subcategory: "centers",
          coordinates: [lng, lat],
          address: fullAddress,
          hours: data.hours_of_operation || "Hours not available",
          phone: data.phone || "Phone not available",
        };
      } catch (error) {
        console.error("Error transforming senior center data:", error);
        return null;
      }
    },
  },
  healthCenters: {
    url: `${BASE_URL}/mw69-m6xi.json`,
    category: "healthcare",
    subcategory: "clinics",
    transform: (data) => {
      try {
        // Check for required fields
        const requiredFields = ["site_name", "address", "location"];
        const missingFields = requiredFields.filter((field) => !data[field]);

        if (missingFields.length > 0) {
          console.warn(
            `Missing required fields in health center data: ${missingFields.join(
              ", "
            )}`
          );
          return null;
        }

        // Get coordinates from location object
        const lat = parseFloat(data.location.latitude);
        const lng = parseFloat(data.location.longitude);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(
            `Invalid coordinates for ${data.site_name}: lat=${lat}, lng=${lng}`
          );
          return null;
        }

        // Format full address
        const fullAddress = `${data.address}, ${data.city}, ${data.state} ${
          data.zip || ""
        }`.trim();

        return {
          id: data.site_name,
          name: data.site_name,
          description: data.services || "Neighborhood Health Center",
          category: "healthcare",
          subcategory: "clinics",
          coordinates: [lng, lat],
          address: fullAddress,
          hours: data.hours_of_operation || "Hours not available",
          phone: data.phone || "Phone not available",
          website: data.website?.url || null,
        };
      } catch (error) {
        console.error("Error transforming health center data:", error);
        return null;
      }
    },
  },
  cdphClinics: {
    url: `${BASE_URL}/kcki-hnch.json`,
    category: "healthcare",
    subcategory: "clinics",
    transform: (data) => {
      try {
        // Check for required fields
        const requiredFields = ["clinic_name", "address", "location"];
        const missingFields = requiredFields.filter((field) => !data[field]);

        if (missingFields.length > 0) {
          console.warn(
            `Missing required fields in CDPH clinic data: ${missingFields.join(
              ", "
            )}`
          );
          return null;
        }

        // Get coordinates from location object
        const lat = parseFloat(data.location.latitude);
        const lng = parseFloat(data.location.longitude);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(
            `Invalid coordinates for ${data.clinic_name}: lat=${lat}, lng=${lng}`
          );
          return null;
        }

        // Format full address
        const fullAddress = `${data.address}, ${data.city}, ${data.state} ${
          data.zip || ""
        }`.trim();

        return {
          id: data.clinic_name,
          name: data.clinic_name,
          description: "CDPH Clinic",
          category: "healthcare",
          subcategory: "clinics",
          coordinates: [lng, lat],
          address: fullAddress,
          hours: data.hours_of_operation || "Hours not available",
          phone: data.phone || "Phone not available",
          website: data.website?.url || null,
        };
      } catch (error) {
        console.error("Error transforming CDPH clinic data:", error);
        return null;
      }
    },
  },
  libraries: {
    url: `${BASE_URL}/x8fc-8rcq.json`,
    category: "education",
    subcategory: "libraries",
    transform: (data) => {
      try {
        // Check for required fields
        const requiredFields = ["branch_", "address", "location"];
        const missingFields = requiredFields.filter((field) => !data[field]);

        if (missingFields.length > 0) {
          console.warn(
            `Missing required fields in library data: ${missingFields.join(
              ", "
            )}`
          );
          return null;
        }

        // Get coordinates from location object
        const lat = parseFloat(data.location.latitude);
        const lng = parseFloat(data.location.longitude);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(
            `Invalid coordinates for ${data.branch_}: lat=${lat}, lng=${lng}`
          );
          return null;
        }

        // Format full address
        const fullAddress = `${data.address}, ${data.city}, ${data.state} ${
          data.zip || ""
        }`.trim();

        return {
          id: data.branch_,
          name: data.branch_,
          description: "Public Library",
          category: "education",
          subcategory: "libraries",
          coordinates: [lng, lat],
          address: fullAddress,
          hours: data.service_hours || "Hours not available",
          phone: data.phone || "Phone not available",
          website: data.website?.url || null,
        };
      } catch (error) {
        console.error("Error transforming library data:", error);
        return null;
      }
    },
  },
  warmingCenters: {
    url: `${BASE_URL}/h243-v2q5.json`,
    category: "shelter",
    subcategory: "warming",
    transform: (data) => {
      try {
        // Check for required fields
        const requiredFields = ["site_name", "address", "location"];
        const missingFields = requiredFields.filter((field) => !data[field]);

        if (missingFields.length > 0) {
          console.warn(
            `Missing required fields in warming center data: ${missingFields.join(
              ", "
            )}`
          );
          return null;
        }

        // Get coordinates from location object
        const [lng, lat] = data.location.coordinates;

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(
            `Invalid coordinates for ${data.site_name}: lat=${lat}, lng=${lng}`
          );
          return null;
        }

        // Format full address
        const fullAddress = `${data.address}, ${data.city}, ${data.state} ${
          data.zip || ""
        }`.trim();

        return {
          id: data.site_name,
          name: data.site_name,
          description: `${data.site_type} Warming Center`,
          category: "shelter",
          subcategory: "warming",
          coordinates: [lng, lat],
          address: fullAddress,
          hours: data.hours_of_operation || "Hours not available",
          phone: data.phone || "Phone not available",
        };
      } catch (error) {
        console.error("Error transforming warming center data:", error);
        return null;
      }
    },
  },
  fluShots: {
    url: `${BASE_URL}/j8c5-wxd5.json`,
    category: "healthcare",
    subcategory: "vaccines",
    transform: (data) => {
      try {
        // Check for required fields
        const requiredFields = ["facility_name", "street1", "location"];
        const missingFields = requiredFields.filter((field) => !data[field]);

        if (missingFields.length > 0) {
          console.warn(
            `Missing required fields in flu shot location data: ${missingFields.join(
              ", "
            )}`
          );
          return null;
        }

        // Get coordinates from location object
        const [lng, lat] = data.location.coordinates;

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(
            `Invalid coordinates for ${data.facility_name}: lat=${lat}, lng=${lng}`
          );
          return null;
        }

        // Format full address
        const fullAddress = `${data.street1}, ${data.city}, ${data.state} ${
          data.postal_code || ""
        }`.trim();

        return {
          id: data.facility_name,
          name: data.facility_name,
          description: "Flu Shot Location",
          category: "healthcare",
          subcategory: "vaccines",
          coordinates: [lng, lat],
          address: fullAddress,
          hours:
            `${data.begin_time} - ${data.end_time}` || "Hours not available",
          phone: data.phone || "Phone not available",
          website: data.notes?.includes("http") ? data.notes : null,
        };
      } catch (error) {
        console.error("Error transforming flu shot location data:", error);
        return null;
      }
    },
  },
  groceryStores: {
    url: `${BASE_URL}/3e26-zek2.json`,
    category: "food",
    subcategory: "grocery",
    transform: (data) => {
      try {
        // Check for required fields
        const requiredFields = ["store_name", "address", "location"];
        const missingFields = requiredFields.filter((field) => !data[field]);

        if (missingFields.length > 0) {
          console.warn(
            `Missing required fields in grocery store data: ${missingFields.join(
              ", "
            )}`
          );
          return null;
        }

        // Get coordinates from location object
        const [lng, lat] = data.location.coordinates;

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(
            `Invalid coordinates for ${data.store_name}: lat=${lat}, lng=${lng}`
          );
          return null;
        }

        // Format full address
        const fullAddress = `${data.address}, Chicago, IL ${
          data.zip || ""
        }`.trim();

        return {
          id: data.store_name,
          name: data.store_name,
          description: "Grocery Store",
          category: "food",
          subcategory: "grocery",
          coordinates: [lng, lat],
          address: fullAddress,
          hours: "Hours not available",
          phone: "Phone not available",
        };
      } catch (error) {
        console.error("Error transforming grocery store data:", error);
        return null;
      }
    },
  },
  // Remove non-working healthcare endpoints
  // substanceAbuse: { ... },
  // stiClinics: { ... },
  // mentalHealth: { ... },
};

// Helper function to get endpoints by category and subcategory
const getEndpointsByCategory = (category, subcategory = null) => {
  return Object.entries(ENDPOINTS)
    .filter(
      ([_, endpoint]) =>
        endpoint.category === category &&
        (!subcategory || endpoint.subcategory === subcategory)
    )
    .map(([key, endpoint]) => ({ key, ...endpoint }));
};

export const fetchServicesByCategory = async (category, subcategory = null) => {
  try {
    console.log(
      "Fetching services for category:",
      category,
      "subcategory:",
      subcategory
    );
    const endpoints = getEndpointsByCategory(category, subcategory);
    if (endpoints.length === 0) {
      console.warn(
        `No endpoints found for category: ${category}${
          subcategory ? `, subcategory: ${subcategory}` : ""
        }`
      );
      return {
        services: [],
        errors: [
          `No data available for ${category}${
            subcategory ? ` - ${subcategory}` : ""
          } services`,
        ],
      };
    }

    const allServices = [];
    const errors = [];

    for (const endpoint of endpoints) {
      try {
        console.log(`Fetching ${endpoint.key} services...`);
        const response = await fetch(endpoint.url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Received ${data.length} ${endpoint.key} services`);

        const transformedData = data.map(endpoint.transform).filter(Boolean);

        console.log(
          `Successfully transformed ${transformedData.length} ${endpoint.key} services`
        );
        allServices.push(...transformedData);
      } catch (error) {
        const errorMessage = `Error fetching ${endpoint.key}: ${error.message}`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    return {
      services: allServices,
      errors: errors.length > 0 ? errors : null,
    };
  } catch (error) {
    console.error("Error fetching services by category:", error);
    return {
      services: [],
      errors: [error.message],
    };
  }
};

export const getCategories = () => {
  const categories = new Map();
  Object.values(ENDPOINTS).forEach((endpoint) => {
    if (!categories.has(endpoint.category)) {
      categories.set(endpoint.category, new Set());
    }
    categories.get(endpoint.category).add(endpoint.subcategory);
  });
  return Object.fromEntries(
    Array.from(categories.entries()).map(([category, subcategories]) => [
      category,
      Array.from(subcategories),
    ])
  );
};
