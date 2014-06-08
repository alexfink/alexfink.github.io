from PIL import Image
import math

primes = [13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139,
  149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 
  223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 
  283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367] # 373 is a problem
all_primes = [11] + primes
# The levels of green used in the tile backgrounds are [0, 6, 10, 13, 15].  
# But Vynce thought the result was too green-dominated, so I've toned the greens down here.
levels = [[0, 4, 8, 10, 12, 13, 14, 15], [0, 4, 8, 12, 15], [0, 8, 12, 15]]
image_size = 212

# Yes, this whole thing is teeming with bad code reuse.  Ah well.
def wavy(colour, direction, frequency, attenuation, has_sevens, power_in_residue, supercolour, superfrequency, superattenuation, superhas_sevens, supersupercolour):
  colour_data = []
  alpha_data = []
  
  for pixel_x in range(image_size):
    for pixel_y in range(image_size):
      x, y = (pixel_x + 0.5)/image_size - 0.5, 0.5 - (pixel_y + 0.5)/image_size
      cd, sd = math.cos(direction), math.sin(direction)
      rix, riy = cd*x + sd*y, -sd*x + cd*y

      if (supercolour != None):
        superband_position = (riy * superfrequency) % 1
        long_stripe = (supersupercolour != None) or superhas_sevens
        in_stripe = (superband_position < 1/6.0 or superband_position > 5/6.0) or \
                (long_stripe and (superband_position < 1/4.0 or superband_position > 3/4.0))
      else:
        in_stripe = False
      blackening = None

      if (has_sevens):
        if supercolour != None:
          seven_frequency = superfrequency
        else:
          seven_frequency = 14.0
        shading = math.cos(seven_frequency*riy)
        if (shading >= 0):
          colour_approached = (255.0, 255.0, 255.0)
          seven_band_position = (riy * seven_frequency) % 1
          if (supercolour != None) and (seven_band_position < 1/6.0 or seven_band_position > 5/6.0):
            colour_approached = supercolour
          colour_data.append((colour_approached[0]-(colour_approached[0]-colour[0])*(1-shading), 
                              colour_approached[1]-(colour_approached[1]-colour[1])*(1-shading), 
                              colour_approached[2]-(colour_approached[2]-colour[2])*(1-shading)))
        else:
          colour_data.append((colour[0]*(1+shading),
                              colour[1]*(1+shading), 
                              colour[2]*(1+shading)))
      else: # no sevens
        if (supercolour != None):
          superband_position = (riy * superfrequency) % 1
          if in_stripe:
            if superhas_sevens:
              shading = math.cos(superband_position*4*math.pi)
              if (shading >= 0):
                colour_approached = (255.0, 255.0, 255.0)
                if (supersupercolour != None) and (superband_position < 1/12.0 or superband_position > 11/12.0):
                  colour_approached = supersupercolour
                colour_data.append((colour_approached[0]-(colour_approached[0]-supercolour[0])*(1-shading), 
                                    colour_approached[1]-(colour_approached[1]-supercolour[1])*(1-shading), 
                                    colour_approached[2]-(colour_approached[2]-supercolour[2])*(1-shading)))
              else:
                colour_data.append((supercolour[0]*(1+shading),
                                    supercolour[1]*(1+shading), 
                                    supercolour[2]*(1+shading)))
            else:
              if (supersupercolour != None) and not (superband_position < 1/12.0 or superband_position > 11/12.0):
                colour_data.append((supersupercolour[0], supersupercolour[1], supersupercolour[2]))
              else:
                colour_data.append((supercolour[0], supercolour[1], supercolour[2]))
          else:
            colour_data.append((colour[0], colour[1], colour[2]))
        else:
          blackening = math.pow(math.cos(2*riy), 2)
          colour_data.append((colour[0]*blackening, colour[1]*blackening, colour[2]*blackening))
      band_position = (rix * frequency) % 1
      if band_position < 1/6.0 or band_position > 5/6.0:
        if in_stripe:
          alpha_data.append(2 * power_in_residue * attenuation * 256)
        elif (blackening != None):
          alpha_data.append(1.5 * attenuation * 256)
        elif has_sevens:
          alpha_data.append((has_sevens + math.cos(2*seven_frequency*riy)*(has_sevens-1)/2) * attenuation * 256)
        else:
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

p_index = 1
for p in primes:
  p_index += 1
  colour, sevens, residue = base_colour((p+1)/2)
  frequency = math.sqrt(p)*2/3.0
  attenuation = max(1.0/math.sqrt(p), 1/5.0) # stop falling off pretty soon
  direction = math.pi*((math.sqrt(5)+1)/2*p_index + 1.0/4) # in which the bright stripes are

  power_in_residue = 1
  if residue > 1:
    if residue not in all_primes:
      primes_dividing_residue = filter(lambda q: residue % q == 0, all_primes)
      if len(primes_dividing_residue) > 1:
        raise NotImplementedError, "I don't know what to do with %d, whose residue is composite" % p
      power_in_residue = math.log(residue) / math.log(primes_dividing_residue[0])
      residue = primes_dividing_residue[0]
    supercolour, supersevens, superresidue = base_colour((residue+1)/2)
    if superresidue > 1:
      supersupercolour, supersupersevens, supersuperresidue = base_colour((superresidue+1)/2)
      if supersupersevens > 1 or supersuperresidue > 1:
        raise NotImplementedError, "I don't know what to do with %d, which is not smooth at the third step" % p
      if supercolour == [127.5, 127.5, 127.5]:
        supercolour = [0.0, 0.0, 0.0]
    else:
      supersupercolour = None
    if colour == [127.5, 127.5, 127.5]:
      colour = [0.0, 0.0, 0.0]
    superfrequency = math.sqrt(residue)*2/3.0
    superattenuation = max(1.0/math.sqrt(residue), 1/5.0)
  else:
    supercolour = None
    supersevens = 0
    superfrequency = None
    superattenuation = None
    supersupercolour = None

  im = wavy(colour, direction, frequency, attenuation, sevens > 0, power_in_residue, supercolour, superfrequency, superattenuation, supersevens > 0, supersupercolour) 
  print (".tileoverlay.tileoverlay-%d { background-position: 0%% %d%%; }") % (p, (-100*p_index))
  im.save("c0r%02d.png" % p_index)
  im = wavy(colour, direction, frequency, 2*attenuation, sevens > 0, power_in_residue, supercolour, superfrequency, superattenuation, supersevens > 0, supersupercolour) 
  print (".tileoverlay.tileoverlay-%d { background-position: -100%% %d%%; }") % (p*p, (-100*p_index))
  im.save("c1r%02d.png" % p_index)


