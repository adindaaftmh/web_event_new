import React, { useEffect, useState } from "react";
import "./index.css";

export default function Main() {
  const BASE_WIDTH = 1740;
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const s = window.innerWidth / BASE_WIDTH;
      setScale(s);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return (
    <div className="w-screen min-h-screen overflow-x-hidden">
      <div className="main-container w-[1740px] h-[5882px] bg-[#dddddd] relative overflow-hidden mx-auto my-0" style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
        <div className="w-[1688px] h-[139px] relative overflow-hidden z-[14] mt-px mr-0 mb-0 ml-[20px]">
          <div className="w-[1659px] h-[102px] bg-[#312c51] rounded-[20px] absolute top-[20px] left-[13px] shadow-[10px_10px_4px_0_rgba(0,0,0,0.25)] z-[15]" />
          <div className="w-[645px] h-[56px] bg-[#fff] rounded-[20px] absolute top-[43px] left-[527px] z-[19]" />
          <div className="w-[135px] h-[51px] rounded-[10px] absolute top-[45px] left-[1355px] z-20">
            <div className="w-[123px] h-[51px] bg-[#fff] rounded-[10px] border-solid border-[3px] border-[#edc17f] absolute top-0 left-0 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] z-[21]" />
            <span className="flex h-[31px] justify-start items-start font-['Raleway'] text-[23px] font-semibold leading-[27.002px] text-[#edc17f] absolute top-[12px] left-[25px] text-left whitespace-nowrap z-[22]">
              Daftar
            </span>
          </div>
          <div className="w-[123px] h-[51px] bg-yellow-400 rounded-[10px] absolute top-[45px] left-[1505px] z-[23] flex items-center justify-center">
          <span className="block h-[25px] font-['Raleway'] text-[23px] font-semibold leading-[25px] text-[#fff] relative text-left whitespace-nowrap z-[25] mt-[12px] mr-0 mb-0 ml-[26px]">
             Masuk
            </span> 
            <div className="w-[123px] h-[51px] bg-[#edc17f] rounded-[10px] border-solid border-2 border-[#edc17f] absolute top-0 left-0 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] z-[24]" />
          </div>
          <span className="flex h-[24px] justify-start items-start font-['Inter'] text-[26px] font-normal leading-[24px] text-[#fff] absolute top-[53px] left-[48px] text-left whitespace-nowrap z-[18]">
            LOGO
          </span>
          <span className="flex h-[30px] justify-start items-start font-['Raleway'] text-[26px] font-semibold leading-[30px] text-[#fff] absolute top-[57px] left-[265px] text-left whitespace-nowrap z-[16]">
            Event
          </span>
          <span className="flex h-[25px] justify-start items-start font-['Raleway'] text-[26px] font-semibold leading-[25px] text-[#fff] absolute top-[58px] left-[371px] text-left whitespace-nowrap z-[17]">
            Atraksi
          </span>
          <span className="flex h-[27px] justify-start items-start font-['Raleway'] text-[23px] font-semibold leading-[27px] text-[#797777] absolute top-[58px] left-[590px] text-left whitespace-nowrap z-[27]">
            Cari disini
          </span>
          <div className="w-[24px] h-[25px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/4oMioT0CKW.png)] bg-cover bg-no-repeat absolute top-[59px] left-[547px] z-[26]" />
        </div>
        <div className="w-[1520px] h-[389px] relative z-10 mt-[153px] mr-0 mb-0 ml-[123px]">
          <div className="w-[1517px] h-[389px] bg-[#fff] absolute top-0 left-0 z-[8]">
            <div className="w-[1414px] h-[311px] bg-[#d9d9d9] absolute top-[39px] left-[58px] z-[9]" />
            <div className="w-[95px] h-[84px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/FC5hChJUOG.png)] bg-cover bg-no-repeat absolute top-[145px] left-[3px] z-[11]" />
            <div className="w-[41px] h-[41px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/2EcKCTLkeY.png)] bg-cover bg-no-repeat absolute top-[163px] left-[1452px] z-[13]" />
            <div className="w-[41px] h-[41px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/NS8DLjTydd.png)] bg-cover bg-no-repeat absolute top-[166px] left-[28px] z-[12]" />
          </div>
          <div className="w-[95px] h-[84px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/95cD4niGTO.png)] bg-cover bg-no-repeat absolute top-[146px] left-[1425px] z-10" />
        </div>
        <div className="w-[628px] h-[79px] relative z-[69] mt-[51px] mr-0 mb-0 ml-[52px]">
          <div className="w-[52px] h-[52px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/BCZeHWmeau.png)] bg-cover bg-no-repeat absolute top-0 left-0 z-[29]" />
          <span className="flex h-[60px] justify-start items-start font-['Archivo'] text-[43px] font-bold leading-[46.784px] text-[#000] absolute top-[19px] left-[78px] text-left whitespace-nowrap z-[33]">
            Event Terbaru{" "}
          </span>
          <div className="w-[229px] h-[39px] bg-[rgba(217,217,217,0)] rounded-[30px] border-solid border border-[#535353] absolute top-[26px] left-[379px] shadow-[1px_5px_4px_0_rgba(0,0,0,0.25)] z-[69]" />
          <span className="flex h-[31px] justify-start items-start font-['Raleway'] text-[20px] font-medium leading-[23.48px] text-[#2225c9] absolute top-[34px] left-[396px] text-left whitespace-nowrap z-[34]">
            Lihat selengkapnya{" "}
          </span>
        </div>
        <div className="w-[1717px] h-[497px] relative z-[60] mt-[29px] mr-0 mb-0 ml-[12px]">
          <div className="w-[361px] h-[219px] bg-[#4e76a9] rounded-[19px] absolute top-0 left-[482px] z-[52]">
            <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[88px] left-[152px] text-left whitespace-nowrap z-[56]">
              Flyer
            </span>
          </div>
          <div className="w-[361px] h-[491px] bg-[#fff] rounded-[20px] absolute top-[2px] left-[482px] shadow-[6px_8px_4px_0_rgba(0,0,0,0.25)] z-[36]">
            <div className="w-[361px] h-[36px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/EDbDn0d7bH.png)] bg-cover bg-no-repeat relative z-[62] mt-[199px] mr-0 mb-0 ml-0" />
            <div className="w-[315.375px] h-[24.25px] relative z-[105] mt-[19.75px] mr-0 mb-0 ml-[23.625px]">
              <div className="w-[15.75px] h-[19.087px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/SmA1jY4d2N.png)] bg-[length:100%_100%] bg-no-repeat absolute top-0 left-0 z-[105]" />
              <span className="flex h-[14px] justify-start items-start font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] absolute top-[3.25px] left-[27.375px] text-left whitespace-nowrap z-[75]">
                Tangerang
              </span>
              <div className="w-[107px] h-[21px] bg-[rgba(31,239,12,0.29)] rounded-[20px] absolute top-[3.25px] left-[208.375px] z-[95]">
                <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#000] absolute top-[5px] left-[21px] text-left whitespace-nowrap z-40">
                  Tiket Tersedia
                </span>
              </div>
            </div>
            <div className="flex w-[106.25px] h-[16.625px] justify-between items-center relative z-[113] mt-[8.625px] mr-0 mb-0 ml-[22.75px]">
              <div className="w-[17.5px] h-[16.625px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/mEvoMQadmG.png)] bg-[length:100%_100%] bg-no-repeat relative z-[113]" />
              <span className="h-[14px] shrink-0 font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] relative text-left whitespace-nowrap z-[79]">
                10 July 2025
              </span>
            </div>
            <span className="block h-[38px] font-['Raleway'] text-[25px] font-bold leading-[29.35px] text-[#323232] relative text-left whitespace-nowrap z-[48] mt-[24.75px] mr-0 mb-0 ml-[15px]">
              Nama Event/ Kegiatan
            </span>
            <div className="flex w-[121px] h-[14px] justify-between items-center relative z-[87] mt-[31px] mr-0 mb-0 ml-[15px]">
              <div className="flex w-[40px] h-[14px] justify-between items-center shrink-0 relative z-[83]">
                <div className="w-[14px] h-[14px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/zcLnvTQeq8.png)] bg-cover bg-no-repeat relative z-[44]" />
                <span className="h-[13px] shrink-0 font-['Archivo'] text-[13px] font-semibold leading-[13px] text-[#6e6b6b] relative text-left whitespace-nowrap z-[83]">
                  8.3
                </span>
              </div>
              <span className="h-[10px] shrink-0 font-['Archivo'] text-[10px] font-semibold leading-[10px] text-[#6e6b6b] relative text-left whitespace-nowrap z-[87]">
                (700k+ dipesan)
              </span>
            </div>
            <div className="flex w-[243px] h-[39px] justify-center items-center bg-[rgba(217,217,217,0.2)] rounded-[20px] border-solid border border-[#f06969] relative z-[91] mt-[22px] mr-0 mb-0 ml-[51px]">
              <span className="h-[20px] shrink-0 font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#f06969] relative text-left whitespace-nowrap z-[91]">
                Mulai Rp. 110,000
              </span>
            </div>
          </div>
          <div className="w-[361px] h-[219px] bg-[#4e76a9] rounded-[19px] absolute top-[2px] left-[865px] z-[53]">
            <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[88px] left-[152px] text-left whitespace-nowrap z-[57]">
              Flyer
            </span>
          </div>
          <div className="w-[361px] h-[491px] bg-[#fff] rounded-[20px] absolute top-[3px] left-[96px] shadow-[6px_8px_4px_0_rgba(0,0,0,0.25)] z-[35]">
            <div className="w-[361px] h-[228.5px] relative z-[61] mt-[-1px] mr-0 mb-0 ml-0">
              <div className="w-[361px] h-[219px] bg-[#4e76a9] rounded-[19px] absolute top-0 left-0 z-[51]">
                <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[75px] left-[156px] text-left whitespace-nowrap z-[55]">
                  Flyer
                </span>
              </div>
              <div className="w-[361px] h-[36px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/sRjT2taOOk.png)] bg-cover bg-no-repeat absolute top-[192.5px] left-0 z-[61]" />
            </div>
            <div className="w-[321.375px] h-[23.837px] relative z-[103] mt-[18.5px] mr-0 mb-0 ml-[21.625px]">
              <div className="w-[107px] h-[21px] bg-[rgba(31,239,12,0.29)] rounded-[20px] absolute top-0 left-[214.375px] z-[94]">
                <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#000] absolute top-[5px] left-[21px] text-left whitespace-nowrap z-[39]">
                  Tiket Tersedia
                </span>
              </div>
              <div className="w-[15.75px] h-[19.087px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/niLSUeH6vB.png)] bg-[length:100%_100%] bg-no-repeat absolute top-[4.75px] left-0 z-[103]" />
              <span className="flex h-[14px] justify-start items-start font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] absolute top-[7px] left-[26.375px] text-left whitespace-nowrap z-[74]">
                Tangerang
              </span>
            </div>
            <div className="flex w-[101.25px] h-[16.625px] justify-between items-center relative z-[111] mt-[13.788px] mr-0 mb-0 ml-[20.75px]">
              <div className="w-[17.5px] h-[16.625px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/U22BkEAnLa.png)] bg-[length:100%_100%] bg-no-repeat relative z-[111]" />
              <span className="h-[14px] shrink-0 font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] relative text-left whitespace-nowrap z-[78]">
                10 July 2025
              </span>
            </div>
            <span className="block h-[38px] font-['Raleway'] text-[25px] font-bold leading-[29.35px] text-[#323232] relative text-left whitespace-nowrap z-[47] mt-[16.75px] mr-0 mb-0 ml-[19px]">
              Nama Event/ Kegiatan
            </span>
            <div className="flex w-[123px] h-[14px] justify-between items-center relative z-[86] mt-[31px] mr-0 mb-0 ml-[17px]">
              <div className="flex w-[40px] h-[14px] justify-between items-center shrink-0 relative z-[82]">
                <div className="w-[14px] h-[14px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/7Ogo1M8jcc.png)] bg-cover bg-no-repeat relative z-[43]" />
                <span className="h-[13px] shrink-0 font-['Archivo'] text-[13px] font-semibold leading-[13px] text-[#6e6b6b] relative text-left whitespace-nowrap z-[82]">
                  8.3
                </span>
              </div>
              <span className="h-[10px] shrink-0 font-['Archivo'] text-[10px] font-semibold leading-[10px] text-[#6e6b6b] relative text-left whitespace-nowrap z-[86]">
                (700k+ dipesan)
              </span>
            </div>
            <div className="flex w-[243px] h-[39px] justify-center items-center bg-[rgba(217,217,217,0.2)] rounded-[20px] border-solid border border-[#f06969] relative z-[90] mt-[22px] mr-0 mb-0 ml-[55px]">
              <span className="h-[20px] shrink-0 font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#f06969] relative text-left whitespace-nowrap z-[90]">
                Mulai Rp. 110,000
              </span>
            </div>
          </div>
          <div className="w-[361px] h-[219px] bg-[#4e76a9] rounded-[19px] absolute top-[4px] left-[1248px] z-[54]">
            <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[88px] left-[152px] text-left whitespace-nowrap z-[58]">
              Flyer
            </span>
          </div>
          <div className="w-[361px] h-[491px] bg-[#fff] rounded-[20px] absolute top-[6px] left-[865px] shadow-[6px_8px_4px_0_rgba(0,0,0,0.25)] z-[37]">
            <div className="w-[361px] h-[36px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/MzYv3Adheb.png)] bg-cover bg-no-repeat relative z-[63] mt-[197.5px] mr-0 mb-0 ml-0" />
            <div className="w-[310.375px] h-[23.25px] relative z-[107] mt-[20.25px] mr-0 mb-0 ml-[28.625px]">
              <div className="w-[15.75px] h-[19.087px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/4dDoVuwWiA.png)] bg-[length:100%_100%] bg-no-repeat absolute top-0 left-0 z-[107]" />
              <span className="flex h-[14px] justify-start items-start font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] absolute top-[2.25px] left-[27.375px] text-left whitespace-nowrap z-[76]">
                Tangerang
              </span>
              <div className="w-[107px] h-[21px] bg-[rgba(31,239,12,0.29)] rounded-[20px] absolute top-[2.25px] left-[203.375px] z-[96]">
                <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#000] absolute top-[5px] left-[21px] text-left whitespace-nowrap z-[41]">
                  Tiket Tersedia
                </span>
              </div>
            </div>
            <div className="flex w-[104.25px] h-[17.375px] justify-between items-center relative z-[115] mt-[9.625px] mr-0 mb-0 ml-[27.75px]">
              <div className="w-[17.5px] h-[16.625px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/HCcTh7thdx.png)] bg-[length:100%_100%] bg-no-repeat relative z-[115]" />
              <span className="h-[14px] shrink-0 font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] relative text-left whitespace-nowrap z-[80]">
                10 July 2025
              </span>
            </div>
            <span className="block h-[38px] font-['Raleway'] text-[25px] font-bold leading-[29.35px] text-[#323232] relative text-left whitespace-nowrap z-[49] mt-[23px] mr-0 mb-0 ml-[15px]">
              Nama Event/ Kegiatan
            </span>
            <div className="flex w-[121px] h-[14px] justify-between items-center relative z-[88] mt-[31px] mr-0 mb-0 ml-[15px]">
              <div className="flex w-[40px] h-[14px] justify-between items-center shrink-0 relative z-[84]">
                <div className="w-[14px] h-[14px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/UT0CGJBSMT.png)] bg-cover bg-no-repeat relative z-[45]" />
                <span className="h-[13px] shrink-0 font-['Archivo'] text-[13px] font-semibold leading-[13px] text-[#6e6b6b] relative text-left whitespace-nowrap z-[84]">
                  8.3
                </span>
              </div>
              <span className="h-[10px] shrink-0 font-['Archivo'] text-[10px] font-semibold leading-[10px] text-[#6e6b6b] relative text-left whitespace-nowrap z-[88]">
                (700k+ dipesan)
              </span>
            </div>
            <div className="flex w-[243px] h-[39px] justify-center items-center bg-[rgba(217,217,217,0.2)] rounded-[20px] border-solid border border-[#f06969] relative z-[92] mt-[22px] mr-0 mb-0 ml-[51px]">
              <span className="h-[20px] shrink-0 font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#f06969] relative text-left whitespace-nowrap z-[92]">
                Mulai Rp. 110,000
              </span>
            </div>
          </div>
          <div className="w-[361px] h-[491px] bg-[#fff] rounded-[20px] absolute top-[6px] left-[1248px] shadow-[6px_8px_4px_0_rgba(0,0,0,0.25)] z-[38]">
            <div className="w-[361px] h-[36px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/bhY6RvLxs6.png)] bg-cover bg-no-repeat relative z-[64] mt-[203.5px] mr-0 mb-0 ml-0" />
            <div className="w-[305.375px] h-[22.25px] relative z-[109] mt-[17.25px] mr-0 mb-0 ml-[33.625px]">
              <div className="w-[15.75px] h-[19.087px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/VCtfxOCifJ.png)] bg-[length:100%_100%] bg-no-repeat absolute top-0 left-0 z-[109]" />
              <div className="w-[107px] h-[21px] bg-[rgba(31,239,12,0.29)] rounded-[20px] absolute top-[1.25px] left-[198.375px] z-[97]">
                <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#000] absolute top-[5px] left-[21px] text-left whitespace-nowrap z-[42]">
                  Tiket Tersedia
                </span>
              </div>
              <span className="flex h-[14px] justify-start items-start font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] absolute top-[4.25px] left-[27.375px] text-left whitespace-nowrap z-[77]">
                Tangerang
              </span>
            </div>
            <div className="flex w-[104.25px] h-[16.625px] justify-between items-center relative z-[117] mt-[10.625px] mr-0 mb-0 ml-[32.75px]">
              <div className="w-[17.5px] h-[16.625px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/b5kFhXRCt0.png)] bg-[length:100%_100%] bg-no-repeat relative z-[117]" />
              <span className="h-[14px] shrink-0 font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] relative text-left whitespace-nowrap z-[81]">
                10 July 2025
              </span>
            </div>
            <span className="block h-[38px] font-['Raleway'] text-[25px] font-bold leading-[29.35px] text-[#323232] relative text-left whitespace-nowrap z-50 mt-[22.75px] mr-0 mb-0 ml-[15px]">
              Nama Event/ Kegiatan
            </span>
            <div className="flex w-[121px] h-[14px] justify-between items-center relative z-[89] mt-[31px] mr-0 mb-0 ml-[15px]">
              <div className="flex w-[40px] h-[14px] justify-between items-center shrink-0 relative z-[85]">
                <div className="w-[14px] h-[14px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/CQBbDWx2yt.png)] bg-cover bg-no-repeat relative z-[46]" />
                <span className="h-[13px] shrink-0 font-['Archivo'] text-[13px] font-semibold leading-[13px] text-[#6e6b6b] relative text-left whitespace-nowrap z-[85]">
                  8.3
                </span>
              </div>
              <span className="h-[10px] shrink-0 font-['Archivo'] text-[10px] font-semibold leading-[10px] text-[#6e6b6b] relative text-left whitespace-nowrap z-[89]">
                (700k+ dipesan)
              </span>
            </div>
            <div className="flex w-[243px] h-[39px] justify-center items-center bg-[rgba(217,217,217,0.2)] rounded-[20px] border-solid border border-[#f06969] relative z-[93] mt-[22px] mr-0 mb-0 ml-[51px]">
              <span className="h-[20px] shrink-0 font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#f06969] relative text-left whitespace-nowrap z-[93]">
                Mulai Rp. 110,000
              </span>
            </div>
          </div>
          <div className="w-[86px] h-[81px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/27Qs32Otft.png)] bg-cover bg-no-repeat absolute top-[158px] left-0 z-[32]" />
          <div className="w-[86px] h-[81px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/vH4BEyRMSm.png)] bg-cover bg-no-repeat absolute top-[184px] left-[1631px] z-[31]" />
          <div className="w-[30px] h-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/ZkPHy0yPit.png)] bg-cover bg-no-repeat absolute top-[200px] left-[30px] z-[59]" />
          <div className="w-[30px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/w1wyzw9jjs.png)] bg-cover bg-no-repeat absolute top-[224px] left-[1660px] z-[60]" />
        </div>
        <div className="w-[351px] h-[60px] relative z-[243] mt-[69px] mr-0 mb-0 ml-[718px]">
          <span className="flex h-[60px] justify-start items-start font-['Archivo'] text-[43px] font-bold leading-[46.784px] text-[#000] absolute top-0 left-[10px] text-left whitespace-nowrap z-[236]">
            Kategori Event
          </span>
          <div className="w-[323.019px] h-[5.025px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/UEhdbhTHVd.png)] bg-cover bg-no-repeat absolute top-[51.975px] left-[-0.02px] z-[243]" />
        </div>
        <div className="flex w-[1477px] h-[310px] justify-between items-center relative z-[239] mt-[83px] mr-0 mb-0 ml-[131px]">
          <div className="w-[710px] h-[310px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/hYs92zrKu8.png)] bg-cover bg-no-repeat rounded-[20px] relative z-[237]">
            <div className="w-[710px] h-[310px] bg-[rgba(94,89,89,0.51)] rounded-[20px] absolute top-0 left-0 shadow-[8px_10px_4px_0_rgba(0,0,0,0.25)] z-[238]">
              <span className="flex h-[60px] justify-start items-start font-['Archivo'] text-[43px] font-extrabold leading-[46.784px] text-[#fff] absolute top-[143px] left-[233px] text-left whitespace-nowrap z-[249]">
                Olahraga
              </span>
            </div>
          </div>
          <div className="w-[710px] h-[310px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/kEd47Q49LS.png)] bg-cover bg-no-repeat rounded-[20px] relative z-[239]">
            <div className="w-[710px] h-[310px] bg-[rgba(94,89,89,0.51)] rounded-[20px] absolute top-0 left-0 shadow-[8px_10px_4px_0_rgba(0,0,0,0.25)] z-[240]">
              <span className="flex h-[60px] justify-start items-start font-['Archivo'] text-[43px] font-extrabold leading-[46.784px] text-[#fff] absolute top-[148px] left-[259px] text-left whitespace-nowrap z-[247]">
                Hiburan
              </span>
            </div>
          </div>
        </div>
        <div className="flex w-[1477px] h-[311px] justify-between items-center relative z-[244] mt-[42px] mr-0 mb-0 ml-[131px]">
          <div className="w-[710px] h-[310px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/b7SU9mQK4p.png)] bg-cover bg-no-repeat rounded-[20px] relative z-[241]">
            <div className="w-[710px] h-[310px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/cExF4Cu5p1.png)] bg-cover bg-no-repeat relative z-[242] mt-0 mr-0 mb-0 ml-px">
              <span className="flex h-[60px] justify-start items-start font-['Archivo'] text-[43px] font-extrabold leading-[46.784px] text-[#fff] absolute top-[133px] left-[238px] text-left whitespace-nowrap z-[246]">
                Edukasi
              </span>
            </div>
          </div>
          <div className="w-[710px] h-[311px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/QCydzEjefp.png)] bg-cover bg-no-repeat rounded-[20px] relative z-[244]">
            <div className="w-[710px] h-[310px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/nyjdSbURUW.png)] bg-cover bg-no-repeat relative z-[245] mt-px mr-0 mb-0 ml-0">
              <span className="flex h-[60px] justify-start items-start font-['Archivo'] text-[43px] font-extrabold leading-[46.784px] text-[#fff] absolute top-[138px] left-[221px] text-left whitespace-nowrap z-[248]">
                Seni Budaya
              </span>
            </div>
          </div>
        </div>
        <div className="w-[1660px] h-[824px] relative z-[121] mt-[168px] mr-0 mb-0 ml-[43px]">
          <div className="w-[1658px] h-[824px] text-[0px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/EojrSVtUY5.png)] bg-cover bg-no-repeat rounded-[20px] absolute top-0 left-0 z-[120]">
            <span className="block h-[60px] font-['Archivo'] text-[55px] font-extrabold leading-[59.84px] text-[#fff] relative text-left whitespace-nowrap z-[122] mt-[128px] mr-0 mb-0 ml-[321px]">
              Petualangan Bahari Di Labuan Bajo{" "}
            </span>
            <span className="block h-[33px] font-['Archivo'] text-[30px] font-normal leading-[32.64px] text-[#fff] relative text-left whitespace-nowrap z-[123] mt-[12px] mr-0 mb-0 ml-[391px]">
              Berlayar ke pulau komodo dan jelajahi gua-gua di labuan bajo
            </span>
            <div className="w-[1103px] h-[397px] relative z-[150] mt-[74px] mr-0 mb-0 ml-[270px]">
              <div className="w-[349px] h-[397px] bg-[#d9d9d9] rounded-[20px] absolute top-0 left-0 z-[124]">
                <div className="w-[349px] h-[204px] relative z-[139] mt-0 mr-0 mb-0 ml-0">
                  <div className="w-[349px] h-[185px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-0 z-[133]">
                    <div className="w-[349px] h-[185px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-0 z-[136]">
                      <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[80px] left-[139px] text-left whitespace-nowrap z-[187]">
                        Flyer
                      </span>
                      <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[80px] left-[139px] text-left whitespace-nowrap z-[190]">
                        Flyer
                      </span>
                    </div>
                  </div>
                  <div className="w-[349px] h-[43px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/C0qyAPBh2U.png)] bg-cover bg-no-repeat absolute top-[161px] left-0 z-[139]">
                    <div className="w-[349px] h-[43px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/WGoB0a6ehj.png)] bg-cover bg-no-repeat absolute top-0 left-0 z-[142]" />
                  </div>
                </div>
                <div className="w-[315px] h-[21px] relative z-[169] mt-[63px] mr-0 mb-0 ml-[15px]">
                  <div className="w-[18.788px] h-[18.788px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/PrWWiDYdZ6.png)] bg-cover bg-no-repeat absolute top-0 left-0 z-[127]" />
                  <div className="w-[18.788px] h-[18.788px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/dRQOEaL1wT.png)] bg-cover bg-no-repeat absolute top-0 left-0 z-[130]" />
                  <div className="w-[107px] h-[21px] bg-[rgba(31,239,12,0.29)] rounded-[20px] absolute top-0 left-[208px] z-[169]">
                    <div className="w-[107px] h-[21px] bg-[rgba(31,239,12,0.29)] rounded-[20px] absolute top-0 left-0 z-[172]">
                      <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#000] absolute top-[5px] left-[21px] text-left whitespace-nowrap z-[163]">
                        Tiket Tersedia
                      </span>
                      <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#000] absolute top-[5px] left-[21px] text-left whitespace-nowrap z-[166]">
                        Tiket Tersedia
                      </span>
                    </div>
                  </div>
                  <span className="flex h-[14px] justify-start items-start font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] absolute top-[4px] left-[21px] text-left whitespace-nowrap z-[151]">
                    8.3
                  </span>
                  <span className="flex h-[14px] justify-start items-start font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] absolute top-[4px] left-[21px] text-left whitespace-nowrap z-[154]">
                    8.3
                  </span>
                  <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#4a4a4a] absolute top-[5px] left-[47px] text-left whitespace-nowrap z-[157]">
                    (700k+ dipesan)
                  </span>
                  <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#4a4a4a] absolute top-[5px] left-[47px] text-left whitespace-nowrap z-[160]">
                    (700k+ dipesan)
                  </span>
                </div>
                <div className="w-[14px] h-[14px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/3CS89FfU8p.png)] bg-cover bg-no-repeat relative z-[119] mt-[29px] mr-0 mb-0 ml-[44px]" />
                <div className="w-[243px] h-[39px] bg-[rgba(217,217,217,0.2)] rounded-[20px] border-solid border border-[#f06969] relative z-[181] mt-[2px] mr-0 mb-0 ml-[47px]">
                  <div className="w-[243px] h-[39px] bg-[rgba(217,217,217,0.2)] rounded-[20px] border-solid border border-[#f06969] absolute top-[-1px] left-[-1px] z-[184]">
                    <span className="flex h-[20px] justify-start items-start font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#f06969] absolute top-[9px] left-[44px] text-left whitespace-nowrap z-[175]">
                      Mulai Rp. 110,000
                    </span>
                    <span className="flex h-[20px] justify-start items-start font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#f06969] absolute top-[9px] left-[44px] text-left whitespace-nowrap z-[178]">
                      Mulai Rp. 110,000
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-[349px] h-[397px] bg-[#d9d9d9] rounded-[20px] absolute top-0 left-[374px] z-[125]">
                <div className="w-[349px] h-[204px] relative z-[140] mt-0 mr-0 mb-0 ml-0">
                  <div className="w-[349px] h-[185px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-0 z-[134]">
                    <div className="w-[349px] h-[185px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-0 z-[137]">
                      <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[80px] left-[139px] text-left whitespace-nowrap z-[188]">
                        Flyer
                      </span>
                      <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[80px] left-[139px] text-left whitespace-nowrap z-[191]">
                        Flyer
                      </span>
                    </div>
                  </div>
                  <div className="w-[349px] h-[43px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/ddnAy1bfkX.png)] bg-cover bg-no-repeat absolute top-[161px] left-0 z-[140]">
                    <div className="w-[349px] h-[43px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/JaQcgg3O9Y.png)] bg-cover bg-no-repeat absolute top-0 left-0 z-[143]" />
                  </div>
                </div>
                <div className="w-[315px] h-[21px] relative z-[170] mt-[63px] mr-0 mb-0 ml-[15px]">
                  <div className="w-[18.788px] h-[18.788px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/H4yhamxpSF.png)] bg-cover bg-no-repeat absolute top-0 left-0 z-[128]" />
                  <div className="w-[18.788px] h-[18.788px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/ma2pdiSbp2.png)] bg-cover bg-no-repeat absolute top-0 left-0 z-[131]" />
                  <div className="w-[107px] h-[21px] bg-[rgba(31,239,12,0.29)] rounded-[20px] absolute top-0 left-[208px] z-[170]">
                    <div className="w-[107px] h-[21px] bg-[rgba(31,239,12,0.29)] rounded-[20px] absolute top-0 left-0 z-[173]">
                      <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#000] absolute top-[5px] left-[21px] text-left whitespace-nowrap z-[164]">
                        Tiket Tersedia
                      </span>
                      <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#000] absolute top-[5px] left-[21px] text-left whitespace-nowrap z-[167]">
                        Tiket Tersedia
                      </span>
                    </div>
                  </div>
                  <span className="flex h-[14px] justify-start items-start font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] absolute top-[4px] left-[21px] text-left whitespace-nowrap z-[152]">
                    8.3
                  </span>
                  <span className="flex h-[14px] justify-start items-start font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] absolute top-[4px] left-[21px] text-left whitespace-nowrap z-[155]">
                    8.3
                  </span>
                  <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#4a4a4a] absolute top-[5px] left-[47px] text-left whitespace-nowrap z-[158]">
                    (700k+ dipesan)
                  </span>
                  <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#4a4a4a] absolute top-[5px] left-[47px] text-left whitespace-nowrap z-[161]">
                    (700k+ dipesan)
                  </span>
                </div>
                <div className="w-[243px] h-[39px] bg-[rgba(217,217,217,0.2)] rounded-[20px] border-solid border border-[#f06969] relative z-[182] mt-[45px] mr-0 mb-0 ml-[47px]">
                  <div className="w-[243px] h-[39px] bg-[rgba(217,217,217,0.2)] rounded-[20px] border-solid border border-[#f06969] absolute top-[-1px] left-[-1px] z-[185]">
                    <span className="flex h-[20px] justify-start items-start font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#f06969] absolute top-[9px] left-[44px] text-left whitespace-nowrap z-[176]">
                      Mulai Rp. 110,000
                    </span>
                    <span className="flex h-[20px] justify-start items-start font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#f06969] absolute top-[9px] left-[44px] text-left whitespace-nowrap z-[179]">
                      Mulai Rp. 110,000
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-[349px] h-[397px] bg-[#d9d9d9] rounded-[20px] absolute top-0 left-[748px] z-[126]">
                <div className="w-[349px] h-[204px] relative z-[141] mt-0 mr-0 mb-0 ml-0">
                  <div className="w-[349px] h-[185px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-0 z-[135]">
                    <div className="w-[349px] h-[185px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-0 z-[138]">
                      <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[80px] left-[139px] text-left whitespace-nowrap z-[189]">
                        Flyer
                      </span>
                      <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[80px] left-[139px] text-left whitespace-nowrap z-[192]">
                        Flyer
                      </span>
                    </div>
                  </div>
                  <div className="w-[349px] h-[43px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/6XLU9E1VDt.png)] bg-cover bg-no-repeat absolute top-[161px] left-0 z-[141]">
                    <div className="w-[349px] h-[43px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/1x8cBOr8DS.png)] bg-cover bg-no-repeat absolute top-0 left-0 z-[144]" />
                  </div>
                </div>
                <div className="w-[315px] h-[21px] relative z-[171] mt-[63px] mr-0 mb-0 ml-[15px]">
                  <div className="w-[18.788px] h-[18.788px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/suZeD2c6H4.png)] bg-cover bg-no-repeat absolute top-0 left-0 z-[129]" />
                  <div className="w-[18.788px] h-[18.788px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/R7mdZszQvi.png)] bg-cover bg-no-repeat absolute top-0 left-0 z-[132]" />
                  <div className="w-[107px] h-[21px] bg-[rgba(31,239,12,0.29)] rounded-[20px] absolute top-0 left-[208px] z-[171]">
                    <div className="w-[107px] h-[21px] bg-[rgba(31,239,12,0.29)] rounded-[20px] absolute top-0 left-0 z-[174]">
                      <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#000] absolute top-[5px] left-[21px] text-left whitespace-nowrap z-[165]">
                        Tiket Tersedia
                      </span>
                      <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#000] absolute top-[5px] left-[21px] text-left whitespace-nowrap z-[168]">
                        Tiket Tersedia
                      </span>
                    </div>
                  </div>
                  <span className="flex h-[14px] justify-start items-start font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] absolute top-[4px] left-[21px] text-left whitespace-nowrap z-[153]">
                    8.3
                  </span>
                  <span className="flex h-[14px] justify-start items-start font-['Archivo'] text-[13px] font-semibold leading-[14px] text-[#4a4a4a] absolute top-[4px] left-[21px] text-left whitespace-nowrap z-[156]">
                    8.3
                  </span>
                  <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#4a4a4a] absolute top-[5px] left-[47px] text-left whitespace-nowrap z-[159]">
                    (700k+ dipesan)
                  </span>
                  <span className="flex h-[11px] justify-start items-start font-['Archivo'] text-[10px] font-semibold leading-[10.88px] text-[#4a4a4a] absolute top-[5px] left-[47px] text-left whitespace-nowrap z-[162]">
                    (700k+ dipesan)
                  </span>
                </div>
                <div className="w-[243px] h-[39px] bg-[rgba(217,217,217,0.2)] rounded-[20px] border-solid border border-[#f06969] relative z-[183] mt-[45px] mr-0 mb-0 ml-[47px]">
                  <div className="w-[243px] h-[39px] bg-[rgba(217,217,217,0.2)] rounded-[20px] border-solid border border-[#f06969] absolute top-[-1px] left-[-1px] z-[186]">
                    <span className="flex h-[20px] justify-start items-start font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#f06969] absolute top-[9px] left-[44px] text-left whitespace-nowrap z-[177]">
                      Mulai Rp. 110,000
                    </span>
                    <span className="flex h-[20px] justify-start items-start font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#f06969] absolute top-[9px] left-[44px] text-left whitespace-nowrap z-[180]">
                      Mulai Rp. 110,000
                    </span>
                  </div>
                </div>
              </div>
              <span className="flex w-[344px] h-[34px] justify-start items-start font-['Archivo'] text-[16px] font-medium leading-[17.408px] text-[#4a4a4a] absolute top-[216px] left-[11px] text-left z-[145]">
                Lorem Ipsum Dolor Sit Amet , consectetur adipisicing elit, sed do
                eiusmod tempor
              </span>
              <span className="flex w-[344px] h-[34px] justify-start items-start font-['Archivo'] text-[16px] font-medium leading-[17.408px] text-[#4a4a4a] absolute top-[216px] left-[11px] text-left z-[148]">
                Lorem Ipsum Dolor Sit Amet , consectetur adipisicing elit, sed do
                eiusmod tempor
              </span>
              <span className="flex w-[344px] h-[34px] justify-start items-start font-['Archivo'] text-[16px] font-medium leading-[17.408px] text-[#4a4a4a] absolute top-[216px] left-[385px] text-left z-[146]">
                Lorem Ipsum Dolor Sit Amet , consectetur adipisicing elit, sed do
                eiusmod tempor
              </span>
              <span className="flex w-[344px] h-[34px] justify-start items-start font-['Archivo'] text-[16px] font-medium leading-[17.408px] text-[#4a4a4a] absolute top-[216px] left-[385px] text-left z-[149]">
                Lorem Ipsum Dolor Sit Amet , consectetur adipisicing elit, sed do
                eiusmod tempor
              </span>
              <span className="flex w-[344px] h-[34px] justify-start items-start font-['Archivo'] text-[16px] font-medium leading-[17.408px] text-[#4a4a4a] absolute top-[216px] left-[759px] text-left z-[147]">
                Lorem Ipsum Dolor Sit Amet , consectetur adipisicing elit, sed do
                eiusmod tempor
              </span>
              <span className="flex w-[344px] h-[34px] justify-start items-start font-['Archivo'] text-[16px] font-medium leading-[17.408px] text-[#4a4a4a] absolute top-[216px] left-[759px] text-left z-[150]">
                Lorem Ipsum Dolor Sit Amet , consectetur adipisicing elit, sed do
                eiusmod tempor
              </span>
            </div>
          </div>
          <div className="w-[1658px] h-[824px] bg-[#000] rounded-[20px] opacity-40 absolute top-0 left-[2px] z-[121]" />
        </div>
        <div className="w-[572px] h-[60px] relative z-[213] mt-[61px] mr-0 mb-0 ml-[54px]">
          <div className="w-[54px] h-[54px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/Zs0KJwxqav.png)] bg-cover bg-no-repeat absolute top-0 left-0 z-[213]" />
          <span className="flex h-[49px] justify-start items-start font-['Archivo'] text-[45px] font-extrabold leading-[48.96px] text-[#000] absolute top-[11px] left-[63px] text-left whitespace-nowrap z-[194]">
            Liburan kemana yaa??
          </span>
        </div>
        <div className="w-[1705px] h-[435px] relative z-[201] mt-[55px] mr-0 mb-0 ml-[18px]">
          <div className="w-[294px] h-[435px] text-[0px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-[48px] shadow-[12px_13px_4px_0_rgba(0,0,0,0.25)] z-[195]">
            <span className="block h-[28px] font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] relative text-left whitespace-nowrap z-[207] mt-[159px] mr-0 mb-0 ml-[72px]">
              foto destinasi{" "}
            </span>
            <span className="flex w-[154px] h-[98px] justify-start items-start font-['Archivo'] text-[45px] font-extrabold leading-[48.96px] text-[#fff] relative text-left overflow-hidden z-[202] mt-[122px] mr-0 mb-0 ml-[35px]">
              Lorem <br />
              ipsum
            </span>
          </div>
          <div className="w-[296px] h-[435px] text-[0px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-[371px] shadow-[12px_13px_4px_0_rgba(0,0,0,0.25)] z-[196]">
            <span className="block h-[28px] font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] relative text-left whitespace-nowrap z-[208] mt-[159px] mr-0 mb-0 ml-[76px]">
              foto destinasi{" "}
            </span>
            <span className="flex w-[154px] h-[98px] justify-start items-start font-['Archivo'] text-[45px] font-extrabold leading-[48.96px] text-[#fff] relative text-left overflow-hidden z-[203] mt-[122px] mr-0 mb-0 ml-[42px]">
              Lorem <br />
              ipsum
            </span>
          </div>
          <div className="w-[294px] h-[435px] text-[0px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-[696px] shadow-[12px_13px_4px_0_rgba(0,0,0,0.25)] z-[197]">
            <span className="block h-[28px] font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] relative text-left whitespace-nowrap z-[209] mt-[165px] mr-0 mb-0 ml-[81px]">
              foto destinasi{" "}
            </span>
            <span className="flex w-[154px] h-[98px] justify-start items-start font-['Archivo'] text-[45px] font-extrabold leading-[48.96px] text-[#fff] relative text-left overflow-hidden z-[204] mt-[116px] mr-0 mb-0 ml-[47px]">
              Lorem <br />
              ipsum
            </span>
          </div>
          <div className="w-[294px] h-[435px] text-[0px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-[1021px] shadow-[12px_13px_4px_0_rgba(0,0,0,0.25)] z-[198]">
            <span className="block h-[28px] font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] relative text-left whitespace-nowrap z-[210] mt-[165px] mr-0 mb-0 ml-[94px]">
              foto destinasi{" "}
            </span>
            <span className="flex w-[154px] h-[98px] justify-start items-start font-['Archivo'] text-[45px] font-extrabold leading-[48.96px] text-[#fff] relative text-left overflow-hidden z-[205] mt-[116px] mr-0 mb-0 ml-[52px]">
              Lorem <br />
              ipsum
            </span>
          </div>
          <div className="w-[294px] h-[435px] text-[0px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-[1346px] shadow-[12px_13px_4px_0_rgba(0,0,0,0.25)] z-[199]">
            <span className="block h-[28px] font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] relative text-left whitespace-nowrap z-[211] mt-[167px] mr-0 mb-0 ml-[94px]">
              foto destinasi{" "}
            </span>
            <span className="flex w-[154px] h-[98px] justify-start items-start font-['Archivo'] text-[45px] font-extrabold leading-[48.96px] text-[#fff] relative text-left overflow-hidden z-[206] mt-[114px] mr-0 mb-0 ml-[57px]">
              Lorem <br />
              ipsum
            </span>
          </div>
          <div className="w-[41px] h-[41px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/nyPXNw50Ov.png)] bg-cover bg-no-repeat absolute top-[187px] left-0 z-[200]" />
          <div className="w-[41px] h-[41px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/mkgu3TLso8.png)] bg-cover bg-no-repeat absolute top-[196px] left-[1664px] z-[201]" />
        </div>
        <div className="w-[848px] h-[67px] relative z-[225] mt-[139px] mr-0 mb-0 ml-[387px]">
          <span className="flex h-[67px] justify-start items-start font-['Archivo'] text-[45px] font-extrabold leading-[48.96px] text-[#000] absolute top-0 left-[7px] text-left whitespace-nowrap z-[215]">
            Objek Wisata Terpopuler Di Indonesia
          </span>
          <div className="w-[848px] h-[3px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/8J1vK44bbR.png)] bg-cover bg-no-repeat absolute top-[64px] left-0 z-[225]" />
        </div>
        <div className="w-[1362px] h-[274px] relative z-[226] mt-[104px] mr-0 mb-0 ml-[94px]">
          <div className="w-[323px] h-[274px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-0 z-[226]">
            <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[105px] left-[84px] text-left whitespace-nowrap z-[231]">
              foto destinasi{" "}
            </span>
          </div>
          <span className="flex h-[49px] justify-start items-start font-['Archivo'] text-[45px] font-semibold leading-[48.96px] text-[#000] absolute top-[29px] left-[367px] text-left whitespace-nowrap z-[216]">
            Lorem Ipsum
          </span>
          <span className="flex h-[67px] justify-start items-start font-['Archivo'] text-[45px] font-bold leading-[48.96px] text-[#000] absolute top-[79px] left-[72px] text-left whitespace-nowrap z-[224]">
            Jrajieb
          </span>
          <span className="flex w-[995px] h-[149px] justify-start items-start font-['Archivo'] text-[25px] font-light leading-[27.2px] text-[#000] absolute top-[96px] left-[367px] text-left z-[220]">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </span>
        </div>
        <div className="w-[1374px] h-[274px] relative z-[227] mt-[34px] mr-0 mb-0 ml-[94px]">
          <div className="w-[323px] h-[274px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-0 z-[227]">
            <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[128px] left-[84px] text-left whitespace-nowrap z-[232]">
              foto destinasi{" "}
            </span>
          </div>
          <span className="flex h-[49px] justify-start items-start font-['Archivo'] text-[45px] font-semibold leading-[48.96px] text-[#000] absolute top-[29px] left-[379px] text-left whitespace-nowrap z-[217]">
            Lorem Ipsum
          </span>
          <span className="flex w-[995px] h-[149px] justify-start items-start font-['Archivo'] text-[25px] font-light leading-[27.2px] text-[#000] absolute top-[96px] left-[379px] text-left z-[221]">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </span>
        </div>
        <div className="w-[1362px] h-[274px] relative z-[228] mt-[44px] mr-0 mb-0 ml-[94px]">
          <div className="w-[323px] h-[274px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-0 z-[228]">
            <div className="w-[323px] h-[274px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/iwkwtPWVVt.png)] bg-cover bg-no-repeat relative z-[230] mt-[-0.5px] mr-0 mb-0 ml-0">
              <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[123.5px] left-[78px] text-left whitespace-nowrap z-[233]">
                foto destinasi{" "}
              </span>
            </div>
          </div>
          <span className="flex h-[49px] justify-start items-start font-['Archivo'] text-[45px] font-semibold leading-[48.96px] text-[#000] absolute top-[29px] left-[367px] text-left whitespace-nowrap z-[218]">
            Lorem Ipsum
          </span>
          <span className="flex w-[995px] h-[149px] justify-start items-start font-['Archivo'] text-[25px] font-light leading-[27.2px] text-[#000] absolute top-[96px] left-[367px] text-left z-[222]">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </span>
        </div>
        <div className="w-[1350px] h-[274px] relative z-[229] mt-[44px] mr-0 mb-0 ml-[94px]">
          <div className="w-[323px] h-[274px] bg-[#4e76a9] rounded-[20px] absolute top-0 left-0 z-[229]">
            <span className="flex h-[28px] justify-start items-start font-['Raleway'] text-[24px] font-medium leading-[28px] text-[#000] absolute top-[118px] left-[84px] text-left whitespace-nowrap z-[234]">
              foto destinasi{" "}
            </span>
          </div>
          <span className="flex h-[49px] justify-start items-start font-['Archivo'] text-[45px] font-semibold leading-[48.96px] text-[#000] absolute top-[29px] left-[355px] text-left whitespace-nowrap z-[219]">
            Lorem Ipsum
          </span>
          <span className="flex w-[995px] h-[149px] justify-start items-start font-['Archivo'] text-[25px] font-light leading-[27.2px] text-[#000] absolute top-[96px] left-[355px] text-left z-[223]">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </span>
        </div>
        <div className="w-[1740px] h-[8px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/Do0WBusodk.png)] bg-cover bg-no-repeat relative z-[258] mt-[225px] mr-0 mb-0 ml-0" />
        <span className="block h-[55px] font-['Archivo'] text-[45px] font-semibold leading-[48.96px] text-[#000] relative text-left whitespace-nowrap z-[261] mt-[21px] mr-0 mb-0 ml-[812px]">
          Logo
        </span>
        <div className="flex w-[98.833px] h-[23.833px] justify-between items-center relative z-[265] mt-[13.167px] mr-0 mb-0 ml-[814.167px]">
          <div className="w-[21.667px] h-[21.612px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/s6QrGTHsr2.png)] bg-[length:100%_100%] bg-no-repeat relative z-[265]" />
        <div className="flex w-[58.75px] h-[23.833px] justify-between items-center shrink-0 relative z-[263]">
          <div className="w-[19.5px] h-[19.5px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/sUvpRmcX6R.png)] bg-[length:100%_100%] bg-no-repeat relative z-[263]" />
          <div className="w-[23px] h-[23px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/9FX5UJLdQW.png)] bg-[length:100%_100%] bg-no-repeat relative z-[260]" />
        </div>
      </div>
      <div className="w-[568px] h-[23px] relative z-[267] mt-[37px] mr-0 mb-0 ml-[629px]">
        <span className="flex h-[23px] justify-start items-start font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#b3b3b3] absolute top-0 left-0 text-left whitespace-nowrap z-[253]">
          Apa itu ?
        </span>
        <span className="flex h-[23px] justify-start items-start font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#b3b3b3] absolute top-0 left-[134px] text-left whitespace-nowrap z-[254]">
          Syarat dan ketentuan
        </span>
        <span className="flex h-[23px] justify-start items-start font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#b3b3b3] absolute top-0 left-[378px] text-left whitespace-nowrap z-[256]">
          Kebijakan Privasi
        </span>
        <div className="w-[10px] h-[10px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/33G7v07cHb.png)] bg-cover bg-no-repeat rounded-[50%] absolute top-[6px] left-[103px] z-[267]" />
        <div className="w-[10px] h-[10px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/DcVP14vZz1.png)] bg-cover bg-no-repeat rounded-[50%] absolute top-[6px] left-[350px] z-[266]" />
      </div>
      <span className="block h-[23px] font-['Archivo'] text-[18px] font-semibold leading-[19.584px] text-[#b3b3b3] relative text-left whitespace-nowrap z-[255] mt-[41px] mr-0 mb-0 ml-[834px]">
        @2025
      </span>
      <div className="w-[1748px] h-[599px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/sR1uS3vFPi.png)] bg-cover bg-no-repeat absolute top-[-7px] left-0 z-[7]" />
      <div className="w-[1842px] h-[560px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/iwKYDuLbX7.png)] bg-cover bg-no-repeat absolute top-[-6px] left-[-70px] z-[6]" />
      <div className="w-[2120px] h-[1193px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/LXb7NUrXJM.png)] bg-cover bg-no-repeat absolute top-[523px] left-[-348px]" />
      <div className="w-[2120px] h-[1193px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/Mw1pz52rJ2.png)] bg-cover bg-no-repeat absolute top-[1711px] left-[-362px] z-[1]" />
      <div className="w-[2120px] h-[1193px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/UEGVNFJ2ww.png)] bg-cover bg-no-repeat absolute top-[2899px] left-[-376px] z-[2]" />
      <div className="w-[2120px] h-[1193px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/YL7J8vEH8Z.png)] bg-cover bg-no-repeat absolute top-[4087px] left-[-390px] z-[3]" />
      <div className="w-[2120px] h-[1193px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/eHrT0PMLLt.png)] bg-cover bg-no-repeat absolute top-[5269px] left-[-380px] z-[4]" />
      <div className="w-[1740px] h-[311px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-26/V1arkwnHJL.png)] bg-cover bg-no-repeat absolute top-[5571px] left-0 z-[252]" />
    </div>
  </div>
);
}
