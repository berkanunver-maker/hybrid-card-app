// services/excelService.js
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

export const ExcelService = {
  /**
   * Kartları Excel'e aktar
   * @param {Array} cards - Kart listesi
   * @param {string} fileName - Dosya adı (opsiyonel)
   * @returns {Promise<string>} - Oluşturulan dosya yolu
   */
  exportToExcel: async (cards, fileName = null) => {
    try {
      console.log('📊 Excel export başlatılıyor...', cards.length, 'kart');

      // Dosya adını oluştur
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultFileName = `Kartlar_${timestamp}.xlsx`;
      const finalFileName = fileName || defaultFileName;

      // Kartları Excel formatına dönüştür
      const excelData = cards.map((card, index) => {
        const fields = card.fields || card;
        const voiceNote = card.voice_note || fields.voice_note;

        return {
          'Sıra': index + 1,
          'Şirket': fields.company || '-',
          'İsim': fields.name || '-',
          'Pozisyon': fields.title || '-',
          'Mobil': fields.mobile || '-',
          'Telefon': fields.phone || '-',
          'E-posta': fields.email || '-',
          'Adres': fields.address || '-',
          'Website': fields.website || '-',
          'Ses Notu': voiceNote?.text || '-',
          'Favori': card.isFavorite ? '⭐' : '-',
          'Oluşturma Tarihi': card.createdAt 
            ? new Date(card.createdAt).toLocaleDateString('tr-TR')
            : '-',
        };
      });

      console.log('✅ Excel data hazırlandı:', excelData.length, 'satır');

      // Worksheet oluştur
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Sütun genişliklerini ayarla
      const columnWidths = [
        { wch: 5 },  // Sıra
        { wch: 20 }, // Şirket
        { wch: 20 }, // İsim
        { wch: 20 }, // Pozisyon
        { wch: 18 }, // Mobil
        { wch: 15 }, // Telefon
        { wch: 25 }, // E-posta
        { wch: 40 }, // Adres
        { wch: 25 }, // Website
        { wch: 50 }, // Ses Notu
        { wch: 8 },  // Favori
        { wch: 15 }, // Tarih
      ];
      worksheet['!cols'] = columnWidths;

      // Workbook oluştur
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Kartlar');

      // Excel'i binary olarak oluştur
      const excelBuffer = XLSX.write(workbook, { 
        type: 'base64', 
        bookType: 'xlsx' 
      });

      // Dosya yolunu belirle
      const fileUri = `${FileSystem.documentDirectory}${finalFileName}`;

      // Dosyayı kaydet
      await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
        encoding: 'base64',
      });

      console.log('✅ Excel dosyası oluşturuldu:', fileUri);

      return fileUri;
    } catch (error) {
      console.error('❌ Excel export hatası:', error);
      throw error;
    }
  },

  /**
   * Excel dosyasını paylaş/indir
   * @param {string} fileUri - Dosya yolu
   */
  shareExcel: async (fileUri) => {
    try {
      console.log('🔍 shareExcel başladı:', fileUri);
      
      const isAvailable = await Sharing.isAvailableAsync();
      console.log('🔍 Sharing available:', isAvailable);
      
      if (!isAvailable) {
        console.log('❌ Sharing mevcut değil!');
        throw new Error('Paylaşma özelliği bu cihazda mevcut değil');
      }

      console.log('🔍 Sharing.shareAsync çağrılıyor...');
      
      // Timeout ile kontrol - 2 saniye içinde cevap gelmezse hata
      const sharePromise = Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Excel Dosyasını Paylaş',
        UTI: 'com.microsoft.excel.xlsx',
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Sharing timeout'));
        }, 2000);
      });

      await Promise.race([sharePromise, timeoutPromise]);

      console.log('✅ Excel dosyası paylaşıldı');
    } catch (error) {
      console.error('❌ Excel paylaşma hatası:', error.message);
      throw error;
    }
  },

  /**
   * Klasör bazlı export (kısa yol)
   * @param {Array} cards - Kart listesi
   * @param {string} folderName - Klasör adı
   */
  exportFolderToExcel: async (cards, folderName) => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${folderName}_${timestamp}.xlsx`;
      
      const fileUri = await ExcelService.exportToExcel(cards, fileName);
      
      // Alert ile dosya bilgisini göster VE paylaşma seçeneği sun
      const { Alert, Linking } = require('react-native');
      
      Alert.alert(
        'Excel Oluşturuldu! 📊',
        `${cards.length} kart Excel'e aktarıldı.\n\nDosya: ${fileName}`,
        [
          {
            text: 'Paylaş',
            onPress: async () => {
              try {
                await ExcelService.shareExcel(fileUri);
              } catch (error) {
                Alert.alert(
                  'Paylaşma Başarısız',
                  'Dosyayı manuel olarak paylaşmak için:\n\n1. Dosyalar uygulamasını açın\n2. Expo klasörünü bulun\n3. Excel dosyasını seçin'
                );
              }
            }
          },
          {
            text: 'Tamam',
            style: 'cancel'
          }
        ]
      );
      
      return fileUri;
    } catch (error) {
      console.error('❌ Klasör export hatası:', error);
      throw error;
    }
  },

  /**
   * Tüm kartları export et
   * @param {Array} cards - Tüm kartlar
   */
  exportAllCardsToExcel: async (cards) => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `Tum_Kartlar_${timestamp}.xlsx`;
      
      const fileUri = await ExcelService.exportToExcel(cards, fileName);
      await ExcelService.shareExcel(fileUri);
      
      return fileUri;
    } catch (error) {
      console.error('❌ Toplu export hatası:', error);
      throw error;
    }
  },
};

export default ExcelService;