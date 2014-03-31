from PIL import Image
import math

primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71]
levels = [[0, 4, 8, 10, 12, 13, 14, 15], [0, 6, 10, 13, 15], [0, 8, 12, 15]]
image_size = 212

def wavy(colour, direction, frequency, attenuation, has_sevens, supercolour, superfrequency, superattenuation):
  colour_data = []
  alpha_data = []
  
  for pixel_x in range(image_size):
    for pixel_y in range(image_size):
      x, y = (pixel_x + 0.5)/image_size - 0.5, 0.5 - (pixel_y + 0.5)/image_size
      cd, sd = math.cos(direction), math.sin(direction)
      rix, riy = cd*x + sd*y, -sd*x + cd*y
      if (has_sevens):
        if (supercolour != None):
          raise NotImplementedException, "I don't know how to draw sevens with larger primes"
        shading = math.cos(14*riy)
        if (shading >= 0):
          colour_data.append((255.0-(255.0-colour[0])*(1-shading), 
                              255.0-(255.0-colour[1])*(1-shading), 
                              255.0-(255.0-colour[2])*(1-shading)))
        else:
          colour_data.append((colour[0]*(1+shading),
                              colour[1]*(1+shading), 
                              colour[2]*(1+shading)))
      else: # no sevens
        if (supercolour != None):
          superband_position = (riy * superfrequency) % 1
          if superband_position < 1/6.0 or superband_position > 5/6.0:
            colour_data.append((supercolour[0], supercolour[1], supercolour[2]))
          else:
            colour_data.append((colour[0], colour[1], colour[2]))
        else:
          blackening = math.pow(math.cos(2*riy), 2)
          colour_data.append((colour[0]*blackening, colour[1]*blackening, colour[2]*blackening))
      band_position = (rix * frequency) % 1
      if band_position < 1/6.0 or band_position > 5/6.0:
        alpha_data.append(attenuation * 256)
      else:
        alpha_data.append(0)

  im = Image.new("RGBA", (image_size, image_size))
  im.putdata(colour_data)
  mask = Image.new("L", (image_size, image_size))
  mask.putdata(alpha_data)
  im.putalpha(mask)
  return im

def base_colour(m):
  small_factor_counts = [0, 0, 0, 0]
  for i in range(4):
    q = ([2, 3, 5, 7])[i]
    while m % q == 0:
      m /= q
      small_factor_counts[i] += 1
  colour = [levels[i][min(small_factor_counts[i], len(levels[i])-1)] for i in range(3)]
  mmax = max(colour)
  if (mmax <= 0):
    colour = [127.5, 127.5, 127.5]
  else:
    colour = map(lambda x : x*255.0/mmax, colour)
  return (colour, small_factor_counts[3], m)

p_index = 0
for p in primes:
  p_index += 1
  colour, sevens, residue = base_colour((p+1)/2)
  frequency = math.sqrt(p)*2/3.0
  attenuation = 3/2.0/math.sqrt(p)
  direction = math.pi*((math.sqrt(5)+1)/2*p_index + 1.0/4) # in which the bright stripes are

  if residue != 1:
    supercolour, supersevens, superresidue = base_colour((residue+1)/2)
    if colour == [127.5, 127.5, 127.5]:
      colour = [0.0, 0.0, 0.0]
    superfrequency = math.sqrt(residue)*2/3.0
    superattenuation = 3/2.0/math.sqrt(residue)
  else:
    supercolour = None
    superfrequency = None
    superattenuation = None

  im = wavy(colour, direction, frequency, attenuation, sevens > 0, supercolour, superfrequency, superattenuation) 
  im.save("%s.png" % p)
  im = wavy(colour, direction, frequency, 2*attenuation, sevens > 0, supercolour, superfrequency, superattenuation) 
  im.save("%s.png" % (p*p))

