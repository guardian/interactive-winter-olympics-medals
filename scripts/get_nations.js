import fs from 'fs'
import rp from 'request-promise'

const codes = `USA	 United States	242
CAN	 Canada	226
SUI	 Switzerland	169
OAR	 Olympic Athletes from Russia	168
GER	 Germany	156
JPN	 Japan	124
ITA	 Italy	122
KOR	 South Korea[a]	122
SWE	 Sweden	119
NOR	 Norway	109
FRA	 France	107
FIN	 Finland	106
AUT	 Austria	105
CZE	 Czech Republic	95
CHN	 China	81
SLO	 Slovenia	71
POL	 Poland	62
GBR	 Great Britain	59
SVK	 Slovakia	56
AUS	 Australia	51
KAZ	 Kazakhstan	46
COR	 Korea[a]	35
LAT	 Latvia	34
NED	 Netherlands	33
BLR	 Belarus	33
UKR	 Ukraine	33
ROU	 Romania	27
EST	 Estonia	22
BEL	 Belgium	21
BUL	 Bulgaria	21
NZL	 New Zealand	21
CRO	 Croatia	19
HUN	 Hungary	19
DEN	 Denmark	17
ESP	 Spain	12
ISR	 Israel	10
PRK	 North Korea[a]	10
BRA	 Brazil	9
LTU	 Lithuania	9
TUR	 Turkey	8
CHI	 Chile	7
ARG	 Argentina	6
AND	 Andorra	5
ISL	 Iceland	5
IRL	 Ireland	5
BIH	 Bosnia and Herzegovina	4
COL	 Colombia	4
GEO	 Georgia	4
GRE	 Greece	4
IRI	 Iran	4
MEX	 Mexico	4
SRB	 Serbia	4
TPE	 Chinese Taipei	4
THA	 Thailand	4
ARM	 Armenia	3
JAM	 Jamaica	3
LBN	 Lebanon	3
LIE	 Liechtenstein	3
MKD	 Macedonia	3
MON	 Monaco	3
MNE	 Montenegro	3
NGR	 Nigeria	3
ALB	 Albania	2
BOL	 Bolivia	2
IND	 India	2
KGZ	 Kyrgyzstan	2
MAS	 Malaysia	2
MDA	 Moldova	2
MGL	 Mongolia	2
MAR	 Morocco	2
PAK	 Pakistan	2
PHI	 Philippines	2
POR	 Portugal	2
TOG	 Togo	2
UZB	 Uzbekistan	2
AZE	 Azerbaijan	1
BER	 Bermuda	1
CYP	 Cyprus	1
ECU	 Ecuador	1
ERI	 Eritrea	1
GHA	 Ghana	1
HKG	 Hong Kong	1
KEN	 Kenya	1
KOS	 Kosovo	1
LUX	 Luxembourg	1
MAD	 Madagascar	1
MLT	 Malta	1
PUR	 Puerto Rico	1
SMR	 San Marino	1
SGP	 Singapore	1
RSA	 South Africa	1
TLS	 Timor-Leste	1
TGA	 Tonga	1`.split('\n')
	.map(line => line.split('\t')[0])



const getStuff = async () => {

const table = await rp({uri : `http://api.stats.com/v1/stats/oly/wntr_oly/medals/?season=2014&accept=json&api_key=gmqfer9bzzufxr2w84v52xqt&sig=3d6c4719d61d8b23edcbba94904f93fc2fad921cd6e6486444b923d590063c5a`, 
	json : true })

const mt = table.apiResults[0].league.medals

const dict = {}

codes.forEach( c => {

	const entry = mt.find(row => row.olympicCountry.abbreviation === c)
	dict[c] = entry ? entry.medalCount.gold + entry.medalCount.silver/100 + entry.medalCount.bronze/10000 : -1

})
fs.writeFileSync(`./src/assets/data/nations_lookup.json`, JSON.stringify(dict))

}

getStuff()