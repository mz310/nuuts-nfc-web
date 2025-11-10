import { Link } from 'react-router-dom';

function AboutPage() {
  return (
    <>
      <div className="hero">
        <div className="hero-title">Мазаалай хамгаалалт</div>
        <div className="hero-sub">
          Говийн эзэн Мазаалай бол дэлхийн хамгийн ховор баавгайн төрөлд тооцогддог.
        </div>
      </div>
      
      <div className="board mt-8">
        <div className="board-header">
          <div>
            <div className="board-title">Бидний зорилго</div>
          </div>
        </div>
        <div className="leading-relaxed text-slate-400 dark:text-slate-400">
          <p className="mb-4">
            Мазаалай (Ursus arctos gobiensis) нь Монголын Говьд амьдардаг маш ховор баавгайн дэд төрөл юм. 
            Тэдний тоо маш цөөхөн бөгөөд устах аюулд орсон байна.
          </p>
          <p className="mb-4">
            Энэхүү систем нь байгаль хамгаалагч, судлаач, орон нутгийн иргэд болон бусад 
            хүмүүсийн Мазаалай хамгаалалтын ажилд оруулж буй хувь нэмрийг хүлээн зөвшөөрч, 
            тэмдэглэх зорилготой.
          </p>
          <p className="mb-4">
            NFC карт ашиглан хүмүүсийн хөнгөлөлт, хандив, сайн дурын ажил зэргийг бүртгэж, 
            тэднийг "Мазаалай баатрууд" гэж нэрлэж байна.
          </p>
          <div className="mt-8 text-center">
            <Link to="/" className="btn">Leaderboard руу буцах</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
