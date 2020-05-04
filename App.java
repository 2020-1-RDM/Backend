import java.util.HashMap;
import java.util.Map;

public class App {
  public static void main(String[] args) throws Exception {
    String numRom = "VIII";

    int result = converte(numRom);
    System.out.println(result);
  }

  public static Integer converte(String numRom) throws Exception {
    Map<String, Integer> mapNum = new HashMap<String, Integer>();
    mapNum.put("I", 1);
    mapNum.put("II", 2);
    mapNum.put("III", 3);
    mapNum.put("IV", 4);
    mapNum.put("V", 5);
    mapNum.put("VI", 6);
    mapNum.put("VII", 7);
    mapNum.put("VIII", 8);
    mapNum.put("IX", 9);
    mapNum.put("X", 10);
    mapNum.put("L", 50);
    mapNum.put("C", 100);
    mapNum.put("D", 500);
    mapNum.put("M", 1000);

    String[] num = numRom.split("");

    int result = 0;

    if (numRom != null) {
      for (int i = 0; i < num.length; i++) {
        System.out.println(num[i] + num[i + 1] + num[i + 2] + num[i + 3]);
        if (mapNum.containsValue(num[i] + num[i + 1] + num[i + 2] + num[i + 3])) {
          result = result + mapNum.get(num[i] + num[i + 1] + num[i + 2] + num[i + 3]);
          i = i + 4;
        } else {
          if (mapNum.containsValue(num[i] + num[i + 1] + num[i + 2])) {
            result = result + mapNum.get(num[i] + num[i + 1] + num[i + 2]);
            i = i + 3;

          } else {
            if (mapNum.containsValue(num[i] + num[i + 1])) {
              result = result + mapNum.get(num[i] + num[i + 1]);
              i = i + 2;

            } else {
              if (mapNum.containsValue(num[i])) {
                result = result + mapNum.get(num[i]);
                i++;
              }
            }
          }
        }
      }
    }
    return result;
  }
}
