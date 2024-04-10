import fetch from 'node-fetch';
import FormData from 'form-data';

const pinFileToIPFS = async (imageBuffer, fileName = 'image.png') => {
  const formData = new FormData();
  formData.append("file", imageBuffer, fileName);

  const pinataOptions = {
    cidVersion: 0,
  };
  formData.append("pinataOptions", JSON.stringify(pinataOptions));

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${process.env.PINATA_API_KEY}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error pinning file to IPFS:", errorData);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const url = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    return url;
  } catch (error) {
    console.error("Error in pinFileToIPFS:", error);
  }
};

export default pinFileToIPFS;