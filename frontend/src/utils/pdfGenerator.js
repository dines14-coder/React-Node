import jsPDF from 'jspdf';

export const generateInfluencerPDF = (influencer, fileName = 'influencer_details') => {
  const pdf = new jsPDF();
  let yPos = 20;
  
  // Add logo to top right
  const img = new Image();
  img.src = '/images/cavin_logo.png';
  pdf.addImage(img, 'PNG', 150, 10, 30 ,10);
  
  pdf.setFontSize(16);
  pdf.text(`${influencer.name || 'Influencer'} - onBoarding Report`, 20, yPos);
  yPos += 15;
  
  const hasYouTubeData = (influencer.youtubeInfluencerType && influencer.youtubeInfluencerType !== '-') || 
                         (influencer.youtubeFollowers && influencer.youtubeFollowers > 0) || 
                         (influencer.youtubeLikes && influencer.youtubeLikes > 0) || 
                         (influencer.youtubeVideoCost && influencer.youtubeVideoCost > 0) || 
                         (influencer.youtubeShortsCost && influencer.youtubeShortsCost > 0) ||
                         (influencer.socialMediaPlatforms && influencer.socialMediaPlatforms.toLowerCase().includes('youtube'));
  
  const addSection = (title, data) => {
    if (yPos > 250) {
      pdf.addPage();
      yPos = 20;
    }
    pdf.setFontSize(12);
    pdf.text(title, 20, yPos);
    yPos += 8;
    pdf.setFontSize(9);
    data.forEach(item => {
      if (yPos > 280) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.text(item, 25, yPos);
      yPos += 5;
    });
    yPos += 5;
  };
  
  // Basic Information
  addSection('Basic Information:', [
    `Name: ${influencer.name || '-'}`,
    `Email: ${influencer.email || '-'}`,
    `Date of Birth: ${influencer.dateOfBirth ? new Date(influencer.dateOfBirth).toLocaleDateString() : '-'}`,
    `Age: ${influencer.age || '-'}`,
    `Gender: ${influencer.gender || '-'}`,
    `Language: ${influencer.language || '-'}`,
    `Category: ${influencer.category || '-'}`,
    `Brand Collaboration: ${influencer.brandCollaboration || '-'}`,
    `Location: ${influencer.location || '-'}`
  ]);
  
  // Contact Information
  addSection('Contact Information:', [
    `Contact Number: ${influencer.contactNumber || '-'}`,
    `Address: ${influencer.address || '-'}`,
    `Pincode: ${influencer.pincode || '-'}`,
    `State: ${influencer.state || '-'}`,
    `City: ${influencer.city || '-'}`,
    `Instagram Link: ${influencer.instagramLink || '-'}`,
    `YouTube Link: ${influencer.youtubeLink || '-'}`
  ]);
  
  // Platform Information
  addSection('Platform Information:', [
    `Platform Type: ${influencer.platformType || '-'}`,
    `Social Media Platforms: ${influencer.socialMediaPlatforms || '-'}`
  ]);
  
  // Instagram Details
  addSection('Instagram Details:', [
    `Influencer Type: ${influencer.instagramInfluencerType || '-'}`,
    `Followers: ${influencer.instagramFollowers?.toLocaleString() || '-'}`,
    `Reel Cost: Rs.${influencer.reelCost?.toLocaleString() || '-'}`,
    `Story Cost: Rs.${influencer.storyCost?.toLocaleString() || '-'}`,
    `Total Cost: Rs.${((influencer.reelCost || 0) + (influencer.storyCost || 0)).toLocaleString() || '-'}`,
    `Last 10 Reels Views: ${influencer.last10ReelsViews || '-'}`,
    `Last 10 Reels Reach: ${influencer.last10ReelsReach || '-'}`,
    `Likes: ${influencer.instagramLikes || '-'}`,
    `Comments: ${influencer.instagramComments || '-'}`,
    `Saves: ${influencer.instagramSaves || '-'}`,
    `Shares: ${influencer.instagramShares || '-'}`,
    `Reposts: ${influencer.instagramReposts || '-'}`
  ]);
  
  // YouTube Details (only if data exists)
  if (hasYouTubeData) {
    addSection('YouTube Details:', [
      `Influencer Type: ${influencer.youtubeInfluencerType || '-'}`,
      `Followers: ${influencer.youtubeFollowers?.toLocaleString() || '-'}`,
      `Video Cost: Rs.${influencer.youtubeVideoCost?.toLocaleString() || '-'}`,
      `Shorts Cost: Rs.${influencer.youtubeShortsCost?.toLocaleString() || '-'}`,
      `Total Cost: Rs.${((influencer.youtubeVideoCost || 0) + (influencer.youtubeShortsCost || 0)).toLocaleString() || '-'}`,
      `Last 10 Shorts Views: ${influencer.last10ShortsViews || '-'}`,
      `Last 10 Shorts Reach: ${influencer.last10ShortsReach || '-'}`,
      `Likes: ${influencer.youtubeLikes || '-'}`,
      `Comments: ${influencer.youtubeComments || '-'}`,
      `Saves: ${influencer.youtubeSaves || '-'}`,
      `Shares: ${influencer.youtubeShares || '-'}`
    ]);
  }
  
  // Banking Information
  addSection('Banking Information:', [
    `PAN Number: ${influencer.panNumber || '-'}`,
    `Bank Account Number: ${influencer.bankAccountNumber || '-'}`,
    `IFSC Code: ${influencer.ifscCode || '-'}`,
    `Holder Name: ${influencer.holderName || '-'}`,
    `Bank Name: ${influencer.bankName || '-'}`
  ]);
  
  // Delivery Information
  addSection('Delivery Information:', [
    `Delivery Address Same: ${influencer.deliveryAddressSame || '-'}`,
    `Delivery Address: ${influencer.deliveryAddress || '-'}`
  ]);
  
  // Additional Information
  addSection('Additional Information:', [
    `Agree Terms: ${influencer.agreeTerms ? 'Yes' : 'No'}`,
    `Remarks: ${influencer.remarks || '-'}`,
    // `Status: ${influencer.status || '-'}`,
    `Created At: ${influencer.createdAt ? new Date(influencer.createdAt).toLocaleDateString() : '-'}`,
    // `Updated At: ${influencer.updatedAt ? new Date(influencer.updatedAt).toLocaleDateString() : '-'}`
  ]);
  
  // Negotiation Details (only for Paid platform type)
  if (influencer.negotiation_status !== undefined && influencer.platformType === 'Paid') {
    addSection('Negotiation Details:', [
      // `Negotiation Status: ${influencer.negotiation_status === 1 ? 'Completed' : 'Pending'}`,
      `Negotiation Reel Cost: Rs.${influencer.negotiationCost?.reelCost?.toLocaleString() || '-'}`,
      `Negotiation Video Cost: Rs.${influencer.negotiationCost?.youtubeVideoCost?.toLocaleString() || '-'}`,
      `Negotiation Shorts Cost: Rs.${influencer.negotiationCost?.youtubeShortsCoast?.toLocaleString() || '-'}`
    ]);
  }
  
  pdf.save(`${influencer.name || 'influencer'}_${fileName}.pdf`);
};