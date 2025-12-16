import React, { useState } from "react";
import { bgchitietanh, sizechitiet } from "../assets/ExportImage";
import { useTranslation } from 'react-i18next'
const componentData = {
  "Tên sản phẩm": "Giày Chạy Bộ Nam Running Cloudboom Max - Lime/Raspberry",
  "Thương hiệu": "On Running",
  "Kích cỡ": ["42", "42.5", "43", "44"],
  "Đặc điểm": [
    "Trọng lượng siêu nhẹ 250g, tối ưu tốc độ",
    "Hai lớp Helion™ HF hyper foam hoàn trả năng lượng tối đa",
    "Tấm Speedboard® sợi carbon tinh chỉnh hiệu suất đẩy chân",
    "Thân giày siêu thoáng khí, ôm sát bàn chân",
    "Đế cho cả đường vượt trội cho chạy road",
  ],
};

const detailDescriptionHTML = `
  <div class="p-0"> 
    <h3 class="text-xl font-bold mb-3">ON Cloudboom Max – Đôi giày siêu nhẹ, tối đa đệm, dành cho Marathon</h3>
    <p class="mb-8">
      ON Cloudboom Max là lựa chọn hoàn hảo cho các runner ở mọi trình độ, đặc biệt trong các giải marathon. 
      Với thiết kế tối ưu đệm êm tối đa (Max Cushioning) và khả năng phản hồi lực vượt trội, 
      đôi giày giúp bạn duy trì tốc độ, giảm chấn động và tăng hiệu suất trên mỗi bước chạy.
    </p>
    <div class="mb-8">
      <img src="${bgchitietanh}" alt="Hình ảnh chi tiết sản phẩm" class="w-full h-auto object-cover mb-3"/>
    </div>
    <h4 class="font-bold mt-4 mb-2">Đặc điểm nổi bật</h4>
    <ul class="list-disc list-inside ml-4 mb-4 space-y-1">
      <li>Ứng dụng công nghệ Helion™ HF hyper foam.</li>
      <li>Tấm Speedboard® tinh chỉnh hỗ trợ chuyển động.</li>
      <li>Thân giày siêu thoáng khí ôm sát bàn chân.</li>
      <li>Đế ngoài bền bỉ.</li>
    </ul>
    <h4 class="font-bold mt-4 mb-2">Thông số kỹ thuật</h4>
    <ul class="list-disc list-inside ml-4 mb-4 space-y-1">
      <li>Cushioning: Max</li>
      <li>Road Running Style: Speed</li>
      <li>Drop: 8mm</li>
      <li>Trọng lượng: 250g</li>
      <li>Chất liệu: Thân giày polyester tái chế và TPU, đế cao su, Speedboard® từ 80% CF</li>
      <li>Công nghệ: CloudTec® giúp giảm chấn và hoàn trả năng lượng hiệu quả.</li>
    </ul>
    <h4 class="font-bold mt-6 mb-3 ">Bảng size giày ON Running</h4>
    <img src="${sizechitiet}" alt="Bảng size giày" class="w-full h-auto object-cover mb-3"/>
  </div>
`;

const ComponentContent = ({ data }) => {
  const keys = Object.keys(data);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <tbody>
          {keys.map((key, index) => (
            <tr
              key={key}
              className={`${
                index % 2 === 0 ? "bg-[#f5f5f5]" : "bg-white"
              } border-b border-gray-200 last:border-b-0`}
            >
              <td className="px-6 py-4 font-medium w-2/4 text-gray-700 border-r border-gray-200">
                {key}
              </td>
              <td className="px-6 py-4 whitespace-pre-wrap w-2/3 text-gray-900">
                {Array.isArray(data[key]) ? (
                  <ul className="list-none space-y-1">
                    {data[key].map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm flex items-start">
                        <span className="mr-2 text-lg leading-none">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm">{data[key]}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProductDescriptionTabs = ({ translations }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  // Sử dụng key tab thay vì text dịch trực tiếp, tránh lỗi khi đổi ngôn ngữ
  const [activeTab, setActiveTab] = useState("description");
  const tabs = ["description", "ingredients"];
  console.log(translations[language]?.description);

  const renderContent = (tab) => {
    console.log(translations[language]);
    switch (tab) {
      case "description":
        return (
          <div
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: translations[language]?.description}}
          />
        );
      case "ingredients":
        return <ComponentContent data={componentData} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-10 mb-20">
      {/* --- DESKTOP VERSION --- */}
      <div className="hidden md:block">
        <div className="flex border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold transition-all duration-200 ease-in-out border border-gray-300 -mb-px 
                ${
                  activeTab === tab
                    ? "text-white bg-[#673AB7] border-b-white scale-105"
                    : "text-gray-600 hover:bg-gray-100 bg-gray-50 border-t border-x"
                }`}
            >
              {t(`productDescriptionTabs.${tab}`)}
            </button>
          ))}
        </div>

        <div className="border border-gray-300 rounded-b">
          {activeTab === "description" ? (
            <div className="p-4 md:px-5 md:py-10">
              <div className="border border-gray-300">
                {renderContent(activeTab)}
              </div>
            </div>
          ) : (
            <div className="p-4">{renderContent(activeTab)}</div>
          )}
        </div>
      </div>

      {/* --- MOBILE VERSION --- */}
      <div className="md:hidden">
        <div className="flex flex-col space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => activeTab !== tab && setActiveTab(tab)}
              className={`relative flex justify-between items-center text-base font-medium text-left px-3 py-2 bg-white ${
                activeTab === tab ? "text-[#673AB7]" : "text-gray-800"
              }`}
            >
              <span>{t(`productDescriptionTabs.${tab}`)}</span>
              {activeTab !== tab && (
                <span className="absolute right-3 text-gray-600 text-lg select-none">
                  ⌄
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-3">
          {activeTab && (
            <div className="border border-gray-200 p-3 bg-white">
              {renderContent(activeTab)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDescriptionTabs;
