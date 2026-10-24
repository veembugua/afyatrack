import { useState } from "react";
import type { HealthFacility } from "../../types";
import { addFacility, updateFacility } from "../../services/adminService";
import toast from "react-hot-toast";

interface FacilityFormProps {
  facility?: HealthFacility | null;
  onClose: () => void;
  onSuccess: () => void;
}

const FacilityForm = ({ facility, onClose, onSuccess }: FacilityFormProps) => {
  const [loading, setLoading] = useState(false);

  // ✅ Proper union type assertion
  const initialType =
    (facility?.type as
      | "clinic"
      | "hospital"
      | "healthCentre"
      | "dispensary"
      | undefined) || "clinic";

  const [name, setName] = useState(facility?.name || "");
  const [region, setRegion] = useState(facility?.region || "");
  const [country, setCountry] = useState(facility?.country || "KE");
  const [type, setType] = useState<
    "clinic" | "hospital" | "healthCentre" | "dispensary"
  >(initialType);
  const [address, setAddress] = useState(facility?.address || "");
  const [phone, setPhone] = useState(facility?.phone || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (facility) {
        await updateFacility(facility.id, {
          name,
          region,
          country,
          type,
          address,
          phone,
        });
        toast.success("Facility updated successfully!");
      } else {
        await addFacility(name, region, country, type, address, phone);
        toast.success("Facility added successfully!");
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save facility";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {facility ? "Edit Facility" : "Add New Facility"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region/County <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
                required
              >
                <option value="KE">Kenya</option>
                <option value="UG">Uganda</option>
                <option value="TZ">Tanzania</option>
                <option value="RW">Rwanda</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility Type
            </label>
            <select
              value={type}
              // ✅ Proper union type assertion on change
              onChange={(e) =>
                setType(
                  e.target.value as
                    | "clinic"
                    | "hospital"
                    | "healthCentre"
                    | "dispensary",
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
            >
              <option value="clinic">Clinic</option>
              <option value="hospital">Hospital</option>
              <option value="healthCentre">Health Centre</option>
              <option value="dispensary">Dispensary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254712345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-clinical-600 text-white rounded-lg font-medium hover:bg-clinical-700 transition disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : facility
                  ? "Update Facility"
                  : "Add Facility"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacilityForm;
