import itImg from '../assets/it.jpg';
import artistImg from '../assets/artist.jpg';
import businessImg from '../assets/business.jpg';
import doctorImg from '../assets/doctor.jpg';
import writerImg from '../assets/writer.jpg';
import policeImg from '../assets/police.jpg';
import rangerImg from '../assets/ranger.jpg';
import astronautImg from '../assets/astronaut.jpg';
import movieIndustryImg from '../assets/movieIndustry.jpg';

const industryImageMap = {
  'IT': itImg,
  'Artist': artistImg,
  'Business': businessImg,
  'Doctor': doctorImg,
  'Writer': writerImg,
  'Police': policeImg,
  'Ranger': rangerImg,
  'Astronaut': astronautImg,
  'Movie Industry': movieIndustryImg,
};

export function getIndustryImage(industry) {
  if (!industry) return null;
  return industryImageMap[industry] || null;
}

export function getAvailableIndustries() {
  return Object.keys(industryImageMap);
}
