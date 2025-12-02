const BASE_API_URL = "http://localhost:8000"

// const updateCSVrecord = (input) => {
//     try {
//         const res = fetch(BASE_API_URL + "/update-csv-record", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(input)
//         })
//     } catch (err: unknown) {
//         console.log(err)
//     }
// }


export const searchFace = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(BASE_API_URL + "/search-face?top_k=20&similarity_threshold=0.8", {
            method: "POST",
            body: formData
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json()

    } catch (err: unknown) {
        console.log(err)
        throw err
    }
}

export const uploadFacesZipFile = async (
    zipFile: File,
    signal?: AbortSignal
) => {
    try {
        const formData = new FormData();
        formData.append('file', zipFile);

        const res = await fetch(BASE_API_URL + "/upload-faces", {
            method: "POST",
            body: formData,
            signal: signal
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        return await res.json();
    } catch (err: unknown) {
        console.error("Upload failed:", err);
        throw err;
    }
};

export const updateCSVrecord = async (file: File, adaNumber: string, phoneNumber: string, csvOption: string, signal?: AbortSignal) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(BASE_API_URL + `/update-csv-record?ada_no=${adaNumber}&new_number=${phoneNumber}&csv_file=${csvOption}`, {
            method: "POST",
            body: formData,
            signal: signal
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        return await res.json();
    } catch (err: unknown) {
        console.error("Upload failed:", err);
        throw err;
    }
};